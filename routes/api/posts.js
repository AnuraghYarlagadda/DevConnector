const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

//Bring Models
const User = require("../../models/User");
const Post = require("../../models/Posts");
const Profile = require("../../models/Profile");

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/posts
// @desc    GET all posts
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/posts/:id
// @desc    GET post by id
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }

    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   DEL api/posts/:id
// @desc    Delete a post by id
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "user not authorised" });
    }

    await post.remove();
    res.send({ message: "Post removed" });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //Check if the post has been already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ message: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();

    res.json(post.likes);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    UnLike a post
// @access  Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //Check if the post has been already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ message: "Post has not yet been liked" });
    }

    //get removeIndex
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    if (removeIndex > -1) {
      post.likes.splice(removeIndex, 1);
    }
    await post.save();

    res.json(post.likes);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DEL api/posts/comment/:id/:comment_id
// @desc    Delete comment
// @access  Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    //make sure comment exists
    if (!comment) {
      return res.status(404).json({ message: "Comment doesnot exists" });
    }

    //Check user who's deleting
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "user not authorised" });
    }

    //get removeIndex
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    if (removeIndex > -1) {
      post.comments.splice(removeIndex, 1);
    }
    await post.save();

    res.json(post.comments);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
