const path = require('path'),
	moment = require('moment'),
	hfm = require('hexo-front-matter'),
	fs = require('hexo-fs'),
	extend = require('extend');

/**
 * Updates a post.
 *
 * @method update
 * @param {str} model the type of model being updated
 * @param {Object} post a post model
 * @param {Object} update attributes to update
 * @param {Function} callback
 */
module.exports = function (model, id, update, callback, hexo) {
	function removeExtname(str) {
		return str.substring(0, str.length - path.extname(str).length);
	}

	let post = hexo.model(model).get(id);
	if (!post) {
		return callback('Post not found');
	}
	const config = hexo.config,
		slug = post.slug = hfm.escape(post.slug || post.title, config.filename_case),
		layout = post.layout = (post.layout || config.default_layout).toLowerCase(),
		date = post.date = post.date ? moment(post.date) : moment();

	const split = hfm.split(post.raw),
		frontMatter = split.data,
		compiled = hfm.parse([frontMatter, '---', split.content].join('\n'));

	const preservedKeys = ['title', 'date', 'tags', 'categories', '_content', 'author'];
	Object.keys(hexo.config.metadata || {}).forEach(function (key) {
		preservedKeys.push(key);
	});
	const prev_full = post.full_source;
	let full_source = prev_full;
	if (update.source && update.source !== post.source) {
		// post.full_source only readable ~ see: /hexo/lib/models/post.js
		full_source = hexo.source_dir + update.source;
	}

	preservedKeys.forEach(function (attr) {
		if (attr in update) {
			compiled[attr] = update[attr];
		}
	});
	compiled.date = moment(compiled.date).toDate();

	//delete update._content
	const raw = hfm.stringify(compiled);
	update.raw = raw;
	update.updated = moment();
	update.date = moment(compiled.date);
	// tags and cats are only getters now. ~ see: /hexo/lib/models/post.js
	if (typeof update.tags !== 'undefined') {
		post.setTags(update.tags);
		delete update.tags;
	}
	if (typeof update.categories !== 'undefined') {
		post.setCategories(update.categories);
		delete update.categories;
	}

	extend(post, update);

	post.save().then(function () {
		fs.writeFile(full_source, post.raw, function (err) {
			if (err) return callback(err);

			if (full_source !== prev_full) {
				fs.unlinkSync(prev_full);
				// move asset dir
				const assetPrev = removeExtname(prev_full);
				const assetDest = removeExtname(full_source);
				fs.exists(assetPrev).then(function (exist) {
					if (exist) {
						fs.copyDir(assetPrev, assetDest).then(function () {
							fs.rmdir(assetPrev);
						});
					}
				});
			}

			console.debug('post源:', post._content);
			post.content = post._content;
			hexo.post.render(post.full_source, post).then(function () {
				console.debug('单篇修改后\n', post);
				post.save();
			}).then(function () {
				callback(null, hexo.model(model).get(id));
			});
		});
	});
};
