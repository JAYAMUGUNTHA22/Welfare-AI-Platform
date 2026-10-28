import { Application } from '../models/Application.js';
import { Citizen } from '../models/Citizen.js';

const MAX_APPLICATIONS = 3;
const PENDING_TTL_MS = 24 * 60 * 60 * 1000;
const ACTIVE_STATUSES = ['pending_confirmation', 'submitted'];

function makeSnapshot(body = {}) {
  const schemeId = String(body.schemeId || '').trim();
  const schemeName = String(body.schemeName || '').trim();
  const applicationMethod = ['online', 'offline'].includes(body.applicationMethod) ? body.applicationMethod : 'unknown';
  let applicationUrl = '';
  if (String(body.applicationUrl || '').trim()) {
    try {
      const parsed = new URL(String(body.applicationUrl).trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) return null;
      if (parsed.hostname === 'myscheme.gov.in' || parsed.hostname.endsWith('.myscheme.gov.in')) return null;
      applicationUrl = parsed.href;
    } catch {
      return null;
    }
  } else if (applicationMethod === 'online') {
    return null;
  }
  if (!schemeId || schemeId.length > 160 || !schemeName || schemeName.length > 300) return null;

  return {
    schemeId,
    schemeName,
    provider: String(body.provider || 'Government Scheme').trim().slice(0, 200),
    applicationUrl,
    applicationMethod,
    benefitSummary: String(body.benefitSummary || '').trim().slice(0, 3000),
  };
}

async function expirePendingApplications(userId) {
  const expired = await Application.find({
    userId,
    status: 'pending_confirmation',
    confirmationExpiresAt: { $lte: new Date() },
  }).select('_id').lean();

  if (!expired.length) return;
  const deletion = await Application.deleteMany({ _id: { $in: expired.map(({ _id }) => _id) }, userId, status: 'pending_confirmation' });
  if (deletion.deletedCount) await Citizen.updateOne({ _id: userId }, { $inc: { activeApplicationCount: -deletion.deletedCount } });
}

async function reserveApplicationSlot(userId) {
  return Citizen.findOneAndUpdate(
    {
      _id: userId,
      $or: [
        { activeApplicationCount: { $lt: MAX_APPLICATIONS } },
        { activeApplicationCount: { $exists: false } },
      ],
    },
    { $inc: { activeApplicationCount: 1 } },
    { new: true },
  );
}

async function createApplication(userId, snapshot, status) {
  await expirePendingApplications(userId);

  const existing = await Application.findOne({ userId, schemeId: snapshot.schemeId });
  if (existing) {
    if (existing.status === 'pending_confirmation' && status === 'submitted') {
      existing.status = 'submitted';
      existing.submittedAt = new Date();
      existing.confirmationExpiresAt = null;
      await existing.save();
      return { application: existing, existing: true };
    }
    if (existing.status === 'pending_confirmation') return { application: existing, existing: true };
    return { error: 'This scheme is already in your application list.' };
  }

  const reservedUser = await reserveApplicationSlot(userId);
  if (!reservedUser) return { error: 'You can track applications for up to three schemes. Remove an application before adding another.' };

  try {
    const application = await Application.create({
      userId,
      ...snapshot,
      status,
      startedAt: new Date(),
      submittedAt: status === 'submitted' ? new Date() : null,
      confirmationExpiresAt: status === 'pending_confirmation' ? new Date(Date.now() + PENDING_TTL_MS) : null,
    });
    return { application, existing: false };
  } catch (error) {
    await Citizen.updateOne({ _id: userId }, { $inc: { activeApplicationCount: -1 } });
    if (error?.code === 11000) {
      const duplicate = await Application.findOne({ userId, schemeId: snapshot.schemeId });
      if (duplicate?.status === 'pending_confirmation') return { application: duplicate, existing: true };
      return { error: 'This scheme is already in your application list.' };
    }
    throw error;
  }
}

export async function getMyApplications(req, res) {
  try {
    await expirePendingApplications(req.user._id);
    const [applications, citizen] = await Promise.all([
      Application.find({ userId: req.user._id }).sort({ updatedAt: -1 }).lean(),
      Citizen.findById(req.user._id).select('activeApplicationCount').lean(),
    ]);
    res.json({ applications, activeApplicationCount: citizen?.activeApplicationCount || 0, limit: MAX_APPLICATIONS });
  } catch (error) {
    console.error('Could not load applications:', error.message);
    res.status(500).json({ message: 'Could not load your applications right now.' });
  }
}

export async function startApplication(req, res) {
  try {
    const snapshot = makeSnapshot(req.body);
    if (!snapshot?.applicationUrl) return res.status(400).json({ message: 'A valid official application URL and scheme details are required.' });
    const result = await createApplication(req.user._id, snapshot, 'pending_confirmation');
    if (result.error) return res.status(result.error.startsWith('This scheme') ? 409 : 403).json({ message: result.error });
    res.status(result.existing ? 200 : 201).json({ application: result.application, existing: result.existing });
  } catch (error) {
    console.error('Could not start application:', error.message);
    res.status(500).json({ message: 'Could not start application tracking right now.' });
  }
}

export async function confirmApplication(req, res) {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, status: 'pending_confirmation' },
      { $set: { status: 'submitted', submittedAt: new Date(), confirmationExpiresAt: null } },
      { new: true, runValidators: true },
    );
    if (application) return res.json({ application });
    const existing = await Application.findOne({ _id: req.params.id, userId: req.user._id });
    if (existing?.status === 'submitted') return res.json({ application: existing, alreadyConfirmed: true });
    return res.status(404).json({ message: 'This application confirmation has expired. Please start again.' });
  } catch (error) {
    console.error('Could not confirm application:', error.message);
    res.status(500).json({ message: 'Could not save your application confirmation right now.' });
  }
}

export async function cancelPendingApplication(req, res) {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
      status: 'pending_confirmation',
    });
    if (!application) return res.status(404).json({ message: 'No pending application was found.' });
    await Citizen.updateOne({ _id: req.user._id, activeApplicationCount: { $gt: 0 } }, { $inc: { activeApplicationCount: -1 } });
    res.json({ message: 'The application was not added to your list.' });
  } catch (error) {
    console.error('Could not cancel application:', error.message);
    res.status(500).json({ message: 'Could not update your application right now.' });
  }
}

export async function reserveOfflineApplication(req, res) {
  try {
    const snapshot = makeSnapshot(req.body);
    if (!snapshot || snapshot.applicationUrl) return res.status(400).json({ message: 'Offline scheme details are incomplete. Reopen the scheme and try again.' });
    const result = await createApplication(req.user._id, snapshot, 'pending_confirmation');
    if (result.error) return res.status(result.error.startsWith('This scheme') ? 409 : 403).json({ message: result.error });
    res.status(result.existing ? 200 : 201).json({ application: result.application, existing: result.existing });
  } catch (error) {
    console.error('Could not reserve offline application:', error.message);
    res.status(500).json({ message: 'Could not reserve this application right now.' });
  }
}
