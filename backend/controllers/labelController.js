import githubLabels from '../models/githubLabels.js';

 const addLabel = async (req, res) => {
    if (req.headers["moderator-key"] === process.env.MODERATOR_KEY) {
      const { label } = req.body;
      const githubLabelInfo = githubLabels({ label_type: label });
      await githubLabelInfo.save();
      res.json({ success: true, message: "posted label successfully" });
    }
    else {
      return res.status(403).json({
        error: 'Invalid secret key.'
      });
    }
  };

  export {addLabel}
