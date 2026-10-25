import { authenticate } from '../middleware/auth.js';
import { Document } from '../models/Document.js';

// Simulated dashboard data calculated from user object & mocked missing pieces
export const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    res.set('Cache-Control', 'no-store');
    const documentsCount = await Document.countDocuments({ userId: user._id });

    res.json({
      benefitsReceived: 0,
      currentPotential: 0,
      futurePotential: 0,
      pendingApplications: 0,
      upcomingOpportunities: 0,
      aiMatchedSchemesCount: 0,
      documentsCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};
