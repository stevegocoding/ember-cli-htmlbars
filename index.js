'use strict';

var path = require('path');
var Filter = require('broccoli-filter');

function TemplateCompiler (inputTree, options) {
  if (!(this instanceof TemplateCompiler)) {
    return new TemplateCompiler(inputTree, options);
  }

  Filter.call(this, inputTree, options); // this._super()

  this.options = options || {};
  this.inputTree = inputTree;

  this.precompile = this.options.templateCompiler.precompile;
  this.registerPlugin = this.options.templateCompiler.registerPlugin;

  this.registerPlugins();
  this.initializeFeatures();
}

TemplateCompiler.prototype = Object.create(Filter.prototype);
TemplateCompiler.prototype.constructor = TemplateCompiler;
TemplateCompiler.prototype.extensions = ['hbs', 'handlebars'];
TemplateCompiler.prototype.targetExtension = 'js';

TemplateCompiler.prototype.registerPlugins = function registerPlugins() {
  var plugins = this.options.plugins;

  if (plugins) {
    for (var type in plugins) {
      for (var i = 0, l = plugins[type].length; i < l; i++) {
        this.registerPlugin(type, plugins[type][i]);
      }
    }
  }
};

TemplateCompiler.prototype.initializeFeatures = function initializeFeatures() {
  var FEATURES = this.options.FEATURES;
  var templateCompiler = this.options.templateCompiler;

  if (FEATURES && templateCompiler) {
    for (var feature in FEATURES) {
      templateCompiler._Ember.FEATURES[feature] = FEATURES[feature];
    }
  }
};

TemplateCompiler.prototype.processString = function (string, relativePath) {
  var extensionRegex = /.handlebars|.hbs/gi;
  var filename = relativePath.toString().split('templates' + path.sep).reverse()[0].replace(extensionRegex, '');
  var input = this.precompile(string, false);
  var template = "Ember.Handlebars.template(" + input + ");\n";
  if (this.options.module === true) {
    return 'export default Ember.HTMLBars.template(' + input + ');';
  }
  else {
    return "Ember.TEMPLATES['" + filename + "'] = " + template;
  }
};

module.exports = TemplateCompiler;
