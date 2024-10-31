import HacktoberRepo from '../models/repoModel.js';
import getRepo from '../src/repoInfo.js';
import UserTokenInfo from '../models/tokenModel.js';

const repoData = async (req, res) => {
    const repos = await HacktoberRepo.find({}).exec();
    console.log("here is repo datas", repos);
    res.send(repos);
  };

  const addRepo = async (req, res) => {

    if (req.headers["moderator-key"] === process.env.MODERATOR_KEY) {
      const {
        owner,
        repo,
        type
      } = req.body;
      try {
        if (!owner || !repo || !type) {
          return res.status(400).json({
            error: 'Please fill all the three entries!'
          });
        }
        const tokens = await UserTokenInfo.find({}).exec();
        const tokenArray = tokens.map(token => token.access_token);
        const randomIndex = Math.floor(Math.random() * tokenArray.length);
        const repo_info = await getRepo.getRepoInfo(owner, repo, tokenArray[randomIndex]);
        console.log(repo_info);
        const repo_id = repo_info.id;
        const existingRepo = await HacktoberRepo.findOne({
          repo_id
        });
  
        if (existingRepo) {
          return res.status(409).json({
            error: 'Repository already exists in the database.'
          });
        }
        const newRepo = new HacktoberRepo({
          owner,
          repo,
          repo_id,
          avatar_url: repo_info.owner.avatar_url,
          type
        });
        await newRepo.save();
  
        return res.status(200).json({
          message: 'Repo added successfully.'
        });
      } catch (error) {
        console.error('Error saving the repo:', error);
        return res.status(500).json({
          error: `Internal server error: ${error.toString()}`
        });
      }
    } else {
      return res.status(403).json({
        error: 'Invalid secret key.'
      });
    }
  };

  const deleteRepo =  async (req, res) => {

    if (req.headers["moderator-key"] === process.env.MODERATOR_KEY) {
      const { owner, repo } = req.body;
  
      try {
  
        if (!owner || !repo) {
          return res.status(400).json({
            error: 'Please provide both the owner and the repo name!'
          });
        }
  
  
        const repoToDelete = await HacktoberRepo.findOne({ owner, repo });
  
  
        if (!repoToDelete) {
          return res.status(404).json({
            error: 'Repository not found in the database.'
          });
        }
  
  
        await HacktoberRepo.deleteOne({ _id: repoToDelete._id });
  
        return res.status(200).json({
          message: 'Repo deleted successfully.'
        });
      } catch (error) {
        console.error('Error deleting the repo:', error);
        return res.status(500).json({
          error: `Internal server error: ${error.toString()}`
        });
      }
    } else {
      return res.status(403).json({
        error: 'Invalid secret key.'
      });
    }
  };

  export {repoData, addRepo, deleteRepo}