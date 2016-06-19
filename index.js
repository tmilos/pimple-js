(function () {
  'use strict'

  var self = this

  this.Pimple = function Pimple (services) {
    if (!(this instanceof Pimple)) {
      return new Pimple(services)
    }

    this._keys = {}
    this._values = {}
    this._factories = []
    this._definitions = {}
    this._tags = {}

    if (services) {
      Object.keys(services).forEach(function (service) {
        this.set(service, services[service])
      }, this)
    }
  }

  this.Pimple.prototype.set = function (id, value) {
    if (typeof this._values[id] !== 'undefined') {
      throw new Error('Cannot override instantiated service ' + id)
    }

    this._definitions[id] = value
    this._keys[id] = true

    return this
  }

  this.Pimple.prototype.factory = function (id, callable) {
    if (typeof callable !== 'function') {
      throw new Error('Service factory must be a closure')
    }

    this._factories[id] = callable
    this._keys[id] = true

    return this
  }

  this.Pimple.prototype.extend = function (id, callable) {
    if (typeof callable !== 'function') {
      throw new Error('Service factory must be a closure')
    }
    if (typeof this._definitions[id] === 'undefined') {
      throw new Error('Identifier "' + id + '" is not defined')
    }

    delete this._values[id]

    if (typeof this._factories[id] !== 'undefined') {
      var oldFactory = this._factories[id]
      this._factories[id] = function (c) {
        return callable(oldFactory(c), c)
      }
    } else if (typeof this._definitions[id] === 'function') {
      var oldDefinition = this._definitions[id]
      this._definitions[id] = function (c) {
        return callable(oldDefinition(c), c)
      }
    } else {
      var oldValue = this._definitions[id]
      this._definitions[id] = function (c) {
        return callable(oldValue, c)
      }
    }
  }

  this.Pimple.prototype.definition = function (id) {
    if (typeof this._definitions[id] === 'undefined') {
      throw new Error('Identifier "' + id + '" is not defined')
    }

    return this._definitions[id]
  }

  this.Pimple.prototype.get = function (id) {
    if (typeof this._keys[id] === 'undefined') {
      throw new Error('Identifier "' + id + '" is not defined')
    }

    if (typeof this._values[id] !== 'undefined') {
      // already instantiated
      return this._values[id]
    }
    if (typeof this._factories[id] !== 'undefined') {
      // always call factory
      return this._factories[id](this)
    }
    if (typeof this._definitions[id] === 'function') {
      // definition is a closure, call it to get the value
      this._values[id] = this._definitions[id](this)
    } else {
      // definition is the value
      this._values[id] = this._definitions[id]
    }

    return this._values[id]
  }

  this.Pimple.prototype.has = function (id) {
    return typeof this._keys[id] !== 'undefined'
  }

  this.Pimple.prototype.remove = function (id) {
    if (typeof this._keys[id] !== 'undefined') {
      if (typeof this._factories[id] !== 'undefined') {
        delete this._factories[id]
      }

      delete this._values[id]
      delete this._keys[id]
    }
  }

  this.Pimple.prototype.tag = function (id, tag, attributes) {
    if (typeof this._keys[id] === 'undefined') {
      throw new Error('Identifier "' + id + '" is not defined')
    }

    if (typeof this._tags[tag] === 'undefined') {
      this._tags[tag] = {}
    }
    if (typeof this._tags[tag][id] === 'undefined') {
      this._tags[tag][id] = []
    }
    this._tags[tag][id].push(attributes || {})

    return this
  }

  this.Pimple.prototype.taggedWith = function (tag) {
    if (typeof this._tags[tag] === 'undefined') {
      return {}
    }

    return this._tags[tag]
  }

  this.Pimple.prototype.register = function (provider) {
    if (provider.register === 'function') {
      provider.register(this)
    } else if (typeof provider === 'function') {
      provider(this)
    }

    return this
  }

  // AMD
  if (this.define instanceof Function) {
    this.define('pimple', [], function () { return self.Pimple })
  }
  // CommonJS
  if (typeof module !== 'undefined' && module && module.exports) {
    module.exports = this.Pimple
  }
}).call(this)
