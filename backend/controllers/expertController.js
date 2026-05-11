const Expert = require('../models/Expert');

// GET /experts
exports.getExperts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 6,
      category,
      search,
    } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expert.countDocuments(query);

    const experts = await Expert.find(query)
      .select('-availableSlots')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1 });

    res.json({
      success: true,
      data: experts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /experts/:id
exports.getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }
    res.json({ success: true, data: expert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
