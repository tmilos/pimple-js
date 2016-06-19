
var chai = require('chai')
var expect = chai.expect
var Pimple = require('./../index.js')

describe('Pimple', function () {
  it('should instantiate w/out arguments', function () {
    var p = new Pimple()
    expect(p).to.be.an('object')
  })

  it('should instantiate w/ object argument', function () {
    var p = new Pimple({a: 1, b: 2})
    expect(p).to.be.an('object')
  })

  it('should set value definition', function () {
    var p = new Pimple()
    p.set('a', 1)
  })

  it('should set closure definition', function () {
    var p = new Pimple()
    p.set('a', function (c) {
      return 1
    })
  })

  it('should get defined value', function () {
    var p = new Pimple()
    p.set('a', 3)
    expect(p.get('a')).to.equal(3)
  })

  it('should get defined closure', function () {
    var p = new Pimple()
    p.set('a', function (c) {
      expect(c).to.equal(p)
      return 3
    })
    expect(p.get('a')).to.equal(3)
  })

  it('should call definition closure only once', function () {
    var p = new Pimple()
    var count = 0
    p.set('a', function (c) {
      count++
      return 3
    })
    expect(p.get('a')).to.equal(3)
    expect(p.get('a')).to.equal(3)
    expect(p.get('a')).to.equal(3)
    expect(count).to.equal(1)
  })

  it('should get defined factory', function () {
    var p = new Pimple()
    p.factory('a', function (c) {
      expect(c).to.equal(p)
      return 3
    })
    expect(p.get('a')).to.equal(3)
  })

  it('should call factory closure each time', function () {
    var p = new Pimple()
    var count = 0
    p.factory('a', function (c) {
      count++
      return 3
    })
    expect(p.get('a')).to.equal(3)
    expect(p.get('a')).to.equal(3)
    expect(p.get('a')).to.equal(3)
    expect(count).to.equal(3)
  })

  it('should tag service', function () {
    var p = new Pimple()
    p.set('a', 1)
    p.tag('a', 'tag1', { x: 2 })
    expect(p.taggedWith('tag1')).to.deep.equal({
      'a': [{ x: 2 }]
    })
  })

  it('should support multiple tags', function () {
    var p = new Pimple()
    p.set('a', 1)
    p.set('b', 2)
    p.tag('a', 'tag1', { x: 2 })
    p.tag('a', 'tag1', { x: 3 })
    p.tag('a', 'tag2', { y: 4 })
    expect(p.taggedWith('tag1')).to.deep.equal({
      'a': [
        { x: 2 },
        { x: 3 }
      ]
    })
  })
})
