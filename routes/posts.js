const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const Blocked = require('../models/Blocked');
const uploader = require('../config/multer');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

/** Endpoints **\
 * Create a post
 * Get all posts
 * Get posts created by a user
 * Get a post
 * Update a post
 * Delete a post
 * React to a post
 * Comment on a post
 * Delete a comment
 */

/**
 * @route POST api/posts
 * @desc Create a post
 * @access Private
 */
router.post(
    '/',
    [
        uploader.single('file'),
        check('title', 'Please enter a title').notEmpty(),
        auth
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check if user is blocked
            const blocked = await Blocked.findOne({ user: req.user_id });
            if (blocked) {
                return res.status(400).json({ errors: [{ msg: 'You are blocked' }] });
            }

            // Check title is unique
            const posts = await Post.findOne({ title: req.body.title });
            if (posts) {
                return res.status(400).json({ errors: [{ msg: 'Post already exists' }] });
            }

            const upload = await cloudinary.uploader.upload(req.file.path, { public_id: req.body.title });
            console.log(upload.secure_url);

            const newPost = new Post({
                owner: req.user_id,
                title: req.body.title,
                url: upload.secure_url,
            });

            const post = await newPost.save();

            res.json(post);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

/**
 * @route GET api/posts
 * @desc Get all posts
 * @access Private
*/
router.get('/', auth, async (req, res) => {
    try {
        // Check if user is blocked
        const blocked = await Blocked.findOne({ user: req.user_id });
        if (blocked) {
            return res.status(400).json({ errors: [{ msg: 'You are blocked' }] });
        }

        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/**
 * @route GET api/posts/user/:user_id
 * @desc Get posts created by a user
 * @access Private
*/
router.get('/user', auth, async (req, res) => {
    try {
        // Check if user is blocked
        const blocked = await Blocked.findOne({ user: req.user_id });
        if (blocked) {
            return res.status(400).json({ errors: [{ msg: 'You are blocked' }] });
        }

        const posts = await Post.find({ owner: req.user_id }).sort({ date: -1 });

        res.json(posts);
    } catch (err) {
        console.error(err.message);

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Posts not found' });
        }

        res.status(500).send('Server error');
    }
});

/**
 * @route GET api/posts/:id
 * @desc Get a post
 * @access Private
*/
router.get('/:id', auth, async (req, res) => {
    try {
        // Check if user is blocked
        const blocked = await Blocked.findOne({ user: req.user_id });
        if (blocked) {
            return res.status(400).json({ errors: [{ msg: 'You are blocked' }] });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.status(500).send('Server error');
    }
});

/**
 * @route PUT api/posts/:id
 * @desc Update a post
 * @access Private
*/
router.put(
    '/:id',
    [
    uploader.single('file'),
    check('title', 'Please enter a title').notEmpty(),
    auth
    ], 
    async (req, res) => {
        try {
            // Check if user is blocked
            const blocked = await Blocked.findOne({ user: req.user_id });
            if (blocked) {
                return res.status(400).json({ errors: [{ msg: 'You are blocked' }] });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check title is unique
            let post = await Post.findById(req.params.id);
            if (req.body.title !== post.title) {
                // Check title is unique
                const titlefound = await Post.findOne({ title: req.body.title });
                if (titlefound) {
                    return res.status(400).json({ errors: [{ msg: 'Post already exists' }] });
                }
            }

            cloudinary.uploader.destroy(post.title, function (result) { console.log(result) });
            const upload = await cloudinary.uploader.upload(req.file.path, { public_id: req.body.title });
            console.log(upload.secure_url);

            post = await Post.findByIdAndUpdate(req.params.id, {
                title: req.body.title,
                url: upload.secure_url,
            }, { new: true });

            res.json(post);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

/**
 * @route DELETE api/posts/:id
 * @desc Delete a post
 * @access Private
*/
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is blocked
        const blocked = await Blocked.findOne({ user: req.user_id });
        if (blocked) {
            return res.status(400).json({ errors: [{ msg: 'You are blocked' }] });
        }

        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        if (post.owner.toString() !== req.user_id && req.user_role !== 'moderator') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        cloudinary.uploader.destroy(post.title, function (result) { console.log(result) });

        await Post.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error(err.message);

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.status(500).send('Server error');
    }
});

/**
 * @route PUT api/posts/react/:id
 * @desc React to a post
 * @access Private
*/
router.put('/react/:id', auth, async (req, res) => {
    try {
        // Check if user is blocked
        const blocked = await Blocked.findOne({ user: req.user_id });
        if (blocked) {
            return res.status(400).json({ errors: [{ msg: 'You are blocked' }] });
        }

        const post = await Post.findById(req.params.id);

        if (post.likes.filter(like => like.user.toString() === req.user_id).length > 0) {
            // Unlike post
            post.likes = post.likes.filter(like => like.user.toString() !== req.user_id);
            post.numLikes--;
        } else {
            // Like post
            post.likes.unshift({ user: req.user_id });
            post.numLikes++;
        }

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/**
 * @route POST api/posts/comment/:id
 * @desc Comment on a post
 * @access Private
*/
router.post(
    '/comment/:id',
    [
        check('text', 'Please enter a comment').notEmpty(),
        auth
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Check if user is blocked
            const blocked = await Blocked.findOne({ user: req.user_id });
            if (blocked) {
                return res.status(400).json({ errors: [{ msg: 'You are blocked' }] });
            }

            const post = await Post.findById(req.params.id);

            // Check if user has already commented
            if (post.comments.filter(comment => comment.owner.toString() === req.user_id).length > 0) {
                return res.status(400).json({ errors: [{ msg: 'You have already commented on this post' }] });
            }

            const newComment = {
                text: req.body.text,
                owner: req.user_id
            };

            post.comments.unshift(newComment);
            post.numComments++;

            await post.save();

            res.json(post.comments);
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

/**
 * @route DELETE api/posts/comment/:id/:comment_id
 * @desc Delete a comment
 * @access Private
*/
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        // Check if user is blocked
        const blocked = await Blocked.findOne({ user: req.user_id });
        if (blocked) {
            return res.status(400).json({ errors: [{ msg: 'You are blocked' }] });
        }

        const post = await Post.findById(req.params.id);

        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' });
        }

        if (comment.owner.toString() !== req.user_id && req.user_role !== 'moderator') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        post.comments = post.comments.filter(comment => comment.id !== req.params.comment_id);
        post.numComments--;

        await post.save();

        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;
