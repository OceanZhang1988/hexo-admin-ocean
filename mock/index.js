const express = require('express');
const router = express.Router();
router.get('/posts/list', (req, res) => {
  res.json(require('./data/posts.json'));
});
router.use('/posts/new', (req, res) => {
  res.json(require('./data/new-post.json'));
});
router.post('/posts/cjp3e22lv0007mpbmvqvb4l48', (req, res) => {
  res.json(require('./data/post-save.json'));
});
router.get('/posts/cjp3e22lv0007mpbmvqvb4l48', (req, res) => {
  res.json(require('./data/post-get.json'));
});
router.use('/tags-categories-and-metadata', (req, res) => {
  res.json(require('./data/tags-categories-and-metadata.json'));
});
router.use('/settings/list', (req, res) => {
  res.json(require('./data/settings-list.json'));
});
 
module.exports = (app, server) => {
  return router;
}