const path = require('path');
const fs = require('hexo-fs');
const yml = require('js-yaml');
const deepAssign = require('deep-assign');
const moment = require('moment');
const extend = require('extend');
const updateAny = require('./update');
const updatePage = updateAny.bind(null, 'Page'),
    update = updateAny.bind(null, 'Post'),
    deploy = require('./deploy');



module.exports = function (app, hexo) {

  function addIsDraft(post) {
    post.isDraft = post.source.indexOf('_draft') === 0;
    post.isDiscarded = post.source.indexOf('_discarded') === 0;
    if (post.content){
      console.debug('content 没丢');
    }else {
      console.debug('content 丢了');
    }
    return post;
  }

  function tagsCategoriesAndMetadata() {
    let cats = {}
        , tags = {};
    hexo.model('Category').forEach(function (cat) {
      cats[cat._id] = cat.name;
    });
    hexo.model('Tag').forEach(function (tag) {
      tags[tag._id] = tag.name;
    });
    return {
      categories: cats,
      tags: tags,
      metadata: Object.keys(hexo.config.metadata || {})
    };
  }

  // reads admin panel settings from _admin-config.yml
  // or writes it if it does not exist
  function getSettings() {
    let path = hexo.base_dir + '_admin-config.yml';
    if (!fs.existsSync(path)) {
      hexo.log.d('admin config not found, creating one');
      fs.writeFile(hexo.base_dir + '_admin-config.yml', '');
      return {};
    } else {
      const settings = yml.safeLoad(fs.readFileSync(path));

      if (!settings) return {};
      return settings;
    }
  }

  function remove(id, body, res) {
    let post = hexo.model('Post').get(id);
    if (!post) return res.send(404, "Post not found");
    let newSource = '_discarded/' + post.source.slice('_drafts'.length);
    update(id, { source: newSource }, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      res.done(addIsDraft(post));
    }, hexo);
  }

  function publish(id, body, res) {
    const post = hexo.model('Post').get(id);
    if (!post) return res.send(404, "Post not found");
    const newSource = '_posts/' + post.source.slice('_drafts/'.length);
    update(id, { source: newSource }, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      res.done(addIsDraft(post));
    }, hexo);
  }

  function unpublish(id, body, res) {
    const post = hexo.model('Post').get(id);
    if (!post) return res.send(404, "Post not found");
    const newSource = '_drafts/' + post.source.slice('_posts/'.length);
    update(id, { source: newSource }, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      res.done(addIsDraft(post));
    }, hexo);
  }

  function rename(id, body, res) {
    let model = 'Post';
    let post = hexo.model('Post').get(id);
    if (!post) {
      model = 'Page';
      post = hexo.model('Page').get(id);
      if (!post) return res.send(404, "Post not found");
    }
    // remember old path w/o index.md
    let oldPath = post.full_source;
    oldPath = oldPath.slice(0, oldPath.indexOf('index.md'));

    updateAny(model, id, { source: body.filename }, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      hexo.log.d(`renamed ${model.toLowerCase()} to ${body.filename}`);

      // remove old folder if empty
      if (model === 'Page' && fs.existsSync(oldPath)) {
        if (fs.readdirSync(oldPath).length === 0) {
          fs.rmdirSync(oldPath);
          hexo.log.d('removed old page\'s empty directory');
        }
      }

      res.done(addIsDraft(post));
    }, hexo);
  }

  const use = function (path, fn) {
    app.use(hexo.config.root + 'admin/api/' + path, function (req, res) {
      const done = function (val) {
        if (!val) {
          res.statusCode = 204;
          return res.end('');
        }
        res.setHeader('Content-type', 'application/json');
        res.end(JSON.stringify(val, function (k, v) {
          // tags and cats have posts reference resulting in circular json..
          if (k == 'tags' || k == 'categories') {
            // convert object to simple array
            return v.toArray ? v.toArray().map(function (obj) {
              return obj.name;
            }) : v;
          }
          return v;
        }));
      };
      res.done = done;
      res.send = function (num, data) {
        res.statusCode = num;
        res.end(data);
      };
      fn(req, res);
    });
  };

  use('tags-categories-and-metadata', function (req, res) {
    res.done(tagsCategoriesAndMetadata());
  });

  use('settings/list', function (req, res) {
    res.done(getSettings());
  });

  use('settings/set', function (req, res, next) {
    if (req.method !== 'POST') return next();
    if (!req.body.name) {
      console.log('no name');
      hexo.log.d('no name');
      return res.send(400, 'No name given');
    }
    // value is capable of being false
    if (typeof req.body.value === 'undefined') {
      console.log('no value');
      hexo.log.d('no value');
      return res.send(400, 'No value given');
    }

    const name = req.body.name;
    const value = req.body.value;

    // no addOptions means we just want to set a single value in the admin options
    // usually for text-based option setting
    const addedOptsExist = !!req.body.addedOptions;

    settings = getSettings();
    // create options section if it doesn't exist, ie. first time changing settings
    if (!settings.options) {
      settings.options = {};
    }

    settings.options[name] = value;

    const addedOptions = addedOptsExist ? req.body.addedOptions : 'no additional options';
    if (addedOptsExist) {
      settings = deepAssign(settings, addedOptions);
    }
    hexo.log.d('set', name, '=', value, 'with', JSON.stringify(addedOptions));

    fs.writeFileSync(hexo.base_dir + '_admin-config.yml', yml.safeDump(settings));
    res.done({
      updated: 'Successfully updated ' + name + ' = ' + value,
      settings: settings
    });
  });

  use('pages/list', function (req, res) {
    const page = hexo.model('Page');
    res.done(page.toArray().map(addIsDraft));
  });

  use('pages/new', function (req, res, next) {
    if (req.method !== 'POST') return next();
    if (!req.body) {
      return res.send(400, 'No page body given');
    }
    if (!req.body.title) {
      return res.send(400, 'No title given');
    }

    hexo.post.create({ title: req.body.title, layout: 'page', date: new Date() })
      .error(function (err) {
        console.error(err, err.stack);
        return res.send(500, 'Failed to create page');
      })
      .then(function (file) {
        const source = file.path.slice(hexo.source_dir.length);

        hexo.source.process([source]).then(function () {
          const page = hexo.model('Page').findOne({source: source});
          res.done(addIsDraft(page));
        });
      });
  });


  use('pages/', function (req, res, next) {
    let url = req.url;
    console.log('in pages', url);
    if (url[url.length - 1] === '/') {
      url = url.slice(0, -1);
    }
    const parts = url.split('/');
    const last = parts[parts.length - 1];
    // not currently used?
    if (last === 'remove') {
      return remove(parts[parts.length - 2], req.body, res);
    }
    if (last === 'rename') {
      return remove(parts[parts.length - 2], req.body, res);
    }

    const id = last;
    if (id === 'pages' || !id) return next();
    if (req.method === 'GET') {
      var page = hexo.model('Page').get(id);
      if (!page) return next();
      return res.done(addIsDraft(page));
    }

    if (!req.body) {
      return res.send(400, 'No page body given');
    }

    updatePage(id, req.body, function (err, page) {
      if (err) {
        return res.send(400, err);
      }
      res.done({
        page: addIsDraft(page),
        tagsCategoriesAndMetadata: tagsCategoriesAndMetadata()
      });
    }, hexo);
  });

  use('posts/list', function (req, res) {
    let posts = hexo.model('Post');
    console.debug('取所有:\n');
    res.done(posts.toArray().map(addIsDraft));
  });

  use('posts/new', function (req, res, next) {
    if (req.method !== 'POST') return next();
    if (!req.body) {
      return res.send(400, 'No post body given');
    }
    if (!req.body.title) {
      return res.send(400, 'No title given');
    }

    const postParameters = {title: req.body.title, layout: 'draft', date: new Date(), author: hexo.config.author};
    extend(postParameters, hexo.config.metadata || {});
    hexo.post.create(postParameters)
      .error(function (err) {
        console.error(err, err.stack);
        return res.send(500, 'Failed to create post');
      })
      .then(function (file) {
        const source = file.path.slice(hexo.source_dir.length);
        hexo.source.process([source]).then(function () {
          const post = hexo.model('Post').findOne({source: source.replace(/\\/g, '\/')});
          res.done(addIsDraft(post));
        });
      });
  });

  use('posts/', function (req, res, next) {
    let url = req.url;
    if (url[url.length - 1] === '/') {
      url = url.slice(0, -1);
    }
    const parts = url.split('/');
    const last = parts[parts.length - 1];
    if (last === 'publish') {
      return publish(parts[parts.length - 2], req.body, res);
    }
    if (last === 'unpublish') {
      return unpublish(parts[parts.length - 2], req.body, res);
    }
    if (last === 'remove') {
      return remove(parts[parts.length - 2], req.body, res);
    }
    if (last === 'rename') {
      return rename(parts[parts.length - 2], req.body, res);
    }

    const id = last;
    if (id === 'posts' || !id) return next();
    if (req.method === 'GET') {
      var post = hexo.model('Post').get(id);
      console.debug('从详情传递的过程中丢失\n', post);
      if (!post) return next();
      return res.done(addIsDraft(post));
    }

    if (!req.body) {
      return res.send(400, 'No post body given');
    }

    update(id, req.body, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      res.done({
        post: addIsDraft(post),
        tagsCategoriesAndMetadata: tagsCategoriesAndMetadata()
      });
    }, hexo);
  });

  use('images/upload', function (req, res, next) {
    hexo.log.d('uploading image');
    if (req.method !== 'POST') return next();
    if (!req.body) {
      return res.send(400, 'No post body given');
    }
    if (!req.body.data) {
      return res.send(400, 'No data given');
    }
    const settings = getSettings();

    let imageRootPath = '/uploads';
    let imagePrefix = 'pasted-';
    let askImageFilename = false;
    let overwriteImages = false;
    let imagePathFolderFormat = 'YYYY/MM';
    // check for image settings and set them if they exist
    if (settings.options) {
      askImageFilename = !!settings.options.askImageFilename;
      overwriteImages = !!settings.options.overwriteImages;
      imageRootPath = settings.options.imageRootPath ? settings.options.imageRootPath : imageRootPath;
      imagePrefix = settings.options.imagePrefix ? settings.options.imagePrefix : imagePrefix;
      imagePathFolderFormat = settings.options.imagePathFolderFormat ? settings.options.imagePathFolderFormat : imagePathFolderFormat;
    }
    imageRootPath = path.join(imageRootPath, moment().utcOffset('+08:00').format(imagePathFolderFormat));
    let msg = 'upload successful';
    let i = 0;
    while (fs.existsSync(path.join(hexo.source_dir, imageRootPath, imagePrefix + i + '.png'))) {
      i += 1;
    }
    let filename = path.join(imagePrefix + i + '.png');
    if (req.body.filename) {
      let givenFilename = req.body.filename;
      // check for png ending, add it if not there
      const index = givenFilename.toLowerCase().indexOf('.png');
      if (index < 0 || index != givenFilename.length - 4) {
        givenFilename += '.png';
      }
      hexo.log.d('trying custom filename', givenFilename);
      if (fs.existsSync(path.join(hexo.source_dir, imageRootPath, givenFilename))) {
        if (overwriteImages) {
          hexo.log.d('file already exists, overwriting');
          msg = 'overwrote existing file';
          filename = givenFilename;
        } else {
          hexo.log.d('file already exists, using', filename);
          msg = 'filename already exists, renamed';
        }
      } else {
        filename = givenFilename;
      }
    }

    filename = path.join(imageRootPath, filename);
    const outpath = path.join(hexo.source_dir, filename);

    const dataURI = req.body.data.slice('data:image/png;base64,'.length);
    const buf = Buffer.from(dataURI, 'base64');
    hexo.log.d(`saving image to ${outpath}`);
    fs.writeFile(outpath, buf, function (err) {
      if (err) {
        console.log(err);
      }
      hexo.source.process().then(function () {
        setTimeout(() => {
          res.done({
            src: path.join(hexo.config.root + filename),
            msg: msg
          });
        }, 1000);
      });
    });
  });

  use('deploy', function (req, res, next) {
    if (req.method !== 'POST') return next();
    if (!hexo.config.admin || !hexo.config.admin.deployCommand) {
      return res.done({ error: 'Config value "admin.deployCommand" not found' });
    }
    try {
      deploy(hexo.config.admin.deployCommand, req.body.message, function (err, result) {
        console.log('res', err, result);
        if (err) {
          return res.done({ error: err.message || err });
        }
        res.done(result);
      });
    } catch (e) {
      console.log('EEE', e);
      res.done({ error: e.message });
    }
  });
};
