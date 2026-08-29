(function(global) {
    'use strict';

    function toArray(value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (value instanceof DomLiteCollection) return value.elements;
        if (value instanceof NodeList || value instanceof HTMLCollection) {
            return Array.from(value);
        }
        return [value];
    }

    function parseHtml(html) {
        var template = document.createElement('template');
        template.innerHTML = html.trim();
        return Array.from(template.content.childNodes).filter(function(n) {
            return n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE;
        });
    }

    function normalizeContext(context) {
        if (!context) return document;
        if (context instanceof DomLiteCollection) return context.elements[0] || document;
        if (context instanceof Element || context === document) return context;
        if (Array.isArray(context) && context.length > 0) return context[0];
        return document;
    }

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    function makeDeferred(promise) {
        return {
            then: function(onFulfilled, onRejected) {
                return promise.then(onFulfilled, onRejected);
            },
            catch: function(onRejected) {
                return promise.catch(onRejected);
            },
            fail: function(onRejected) {
                promise.catch(onRejected);
                return this;
            }
        };
    }

    function getElValue(el) {
        if (el == null) return undefined;
        if ('value' in el) return el.value;
        return undefined;
    }

    function setElValue(el, value) {
        if (el == null) return;
        if ('value' in el) el.value = value;
    }

    function DomLiteCollection(elements) {
        this.elements = elements || [];
        this.length = this.elements.length;
        for (var i = 0; i < this.elements.length; i += 1) {
            this[i] = this.elements[i];
        }
    }

    DomLiteCollection.prototype.each = function(callback) {
        this.elements.forEach(function(el, i) {
            callback.call(el, i, el);
        });
        return this;
    };

    DomLiteCollection.prototype.hide = function() {
        return this.each(function() {
            this.style.display = 'none';
        });
    };

    DomLiteCollection.prototype.show = function() {
        return this.each(function() {
            this.style.display = '';
        });
    };

    DomLiteCollection.prototype.val = function(value) {
        if (arguments.length === 0) {
            return getElValue(this.elements[0]);
        }
        return this.each(function() {
            setElValue(this, value);
        });
    };

    DomLiteCollection.prototype.prop = function(name, value) {
        if (arguments.length === 1) {
            var el = this.elements[0];
            return el ? el[name] : undefined;
        }
        return this.each(function() {
            this[name] = value;
        });
    };

    DomLiteCollection.prototype.attr = function(name, value) {
        if (arguments.length === 1) {
            var el = this.elements[0];
            if (!el || !el.getAttribute) return undefined;
            return el.getAttribute(name);
        }
        return this.each(function() {
            if (!this.setAttribute) {
                this[name] = value;
                return;
            }
            this.setAttribute(name, value);
        });
    };

    DomLiteCollection.prototype.html = function(value) {
        if (arguments.length === 0) {
            var el = this.elements[0];
            return el ? el.innerHTML : undefined;
        }
        return this.each(function() {
            this.innerHTML = value;
        });
    };

    DomLiteCollection.prototype.text = function(value) {
        if (arguments.length === 0) {
            var el = this.elements[0];
            return el ? el.textContent : undefined;
        }
        return this.each(function() {
            this.textContent = value;
        });
    };

    DomLiteCollection.prototype.empty = function() {
        return this.each(function() {
            this.innerHTML = '';
        });
    };

    DomLiteCollection.prototype.append = function(content) {
        var nodes;
        if (typeof content === 'string') {
            nodes = parseHtml(content);
        } else {
            nodes = toArray(content);
        }

        return this.each(function() {
            var target = this;
            nodes.forEach(function(node, idx) {
                if (node == null) return;
                var toInsert = idx === 0 ? node : node.cloneNode(true);
                target.appendChild(toInsert);
            });
        });
    };

    DomLiteCollection.prototype.css = function(name, value) {
        if (arguments.length === 1) {
            var el = this.elements[0];
            return el ? global.getComputedStyle(el).getPropertyValue(name) : undefined;
        }
        return this.each(function() {
            this.style.setProperty(name, value);
        });
    };

    DomLiteCollection.prototype.on = function(eventName, selectorOrHandler, maybeHandler) {
        var delegated = typeof selectorOrHandler === 'string';
        var handler = delegated ? maybeHandler : selectorOrHandler;
        var selector = delegated ? selectorOrHandler : null;

        return this.each(function() {
            var el = this;
            var wrapped = handler;
            if (delegated) {
                wrapped = function(evt) {
                    var target = evt.target.closest(selector);
                    if (target && el.contains(target)) {
                        handler.call(target, evt);
                    }
                };
            }
            el.addEventListener(eventName, wrapped);
        });
    };

    DomLiteCollection.prototype.click = function(handler) {
        if (typeof handler === 'function') {
            return this.on('click', handler);
        }
        return this.each(function() {
            this.click();
        });
    };

    DomLiteCollection.prototype.data = function(key, value) {
        if (arguments.length === 1) {
            var el = this.elements[0];
            if (!el) return undefined;
            el.__domLiteData = el.__domLiteData || {};
            return el.__domLiteData[key];
        }
        return this.each(function() {
            this.__domLiteData = this.__domLiteData || {};
            this.__domLiteData[key] = value;
        });
    };

    DomLiteCollection.prototype.load = function(url, callback) {
        var self = this;
        var promise = fetch(url, { cache: 'no-store' })
            .then(function(resp) {
                if (!resp.ok) {
                    throw new Error('Failed to load ' + url + ': ' + resp.status);
                }
                return resp.text();
            })
            .then(function(html) {
                self.html(html);
                if (typeof callback === 'function') {
                    self.each(function() {
                        callback.call(this);
                    });
                }
            });
        return makeDeferred(promise);
    };

    DomLiteCollection.prototype.button = function() {
        return this;
    };

    DomLiteCollection.prototype.selectmenu = function(arg) {
        if (typeof arg === 'string') {
            if (arg === 'refresh') return this;
            return this;
        }

        var options = arg || {};
        if (typeof options.change === 'function') {
            this.each(function() {
                if (this.__selectmenuBound) return;
                this.addEventListener('change', function(evt) {
                    var selected = this.options[this.selectedIndex];
                    var ui = {
                        item: {
                            value: this.value,
                            id: selected ? selected.id : null
                        }
                    };
                    options.change.call(this, evt, ui);
                });
                this.__selectmenuBound = true;
            });
        }
        return this;
    };

    DomLiteCollection.prototype.dialog = function(arg1, arg2, arg3) {
        if (typeof arg1 === 'object' || arg1 == null) {
            var options = arg1 || {};
            return this.each(function() {
                this.__dialogState = this.__dialogState || { options: {} };
                this.__dialogState.options = options;
                if (options.width) {
                    this.style.maxWidth = String(options.width) + 'px';
                }
                if (options.autoOpen === false) {
                    this.style.display = 'none';
                }
            });
        }

        if (arg1 === 'open') {
            return this.each(function() {
                this.style.display = 'block';
            });
        }

        if (arg1 === 'close') {
            return this.each(function() {
                this.style.display = 'none';
            });
        }

        if (arg1 === 'option' && arg2 === 'title') {
            return this.each(function() {
                this.setAttribute('title', arg3);
            });
        }

        return this;
    };

    DomLiteCollection.prototype.tabs = function(options) {
        var opts = options || {};
        var selected = typeof opts.selected === 'number' ? opts.selected : 0;

        return this.each(function() {
            var container = this;
            var links = Array.from(container.querySelectorAll('ul a[href^="#"]'));
            if (links.length === 0) return;

            var panels = links.map(function(link) {
                var id = link.getAttribute('href');
                return container.querySelector(id);
            });

            function activate(idx) {
                links.forEach(function(link, i) {
                    if (link.parentElement) {
                        link.parentElement.classList.toggle('active', i === idx);
                    }
                    var panel = panels[i];
                    if (panel) {
                        panel.style.display = (i === idx) ? '' : 'none';
                    }
                });
            }

            links.forEach(function(link, i) {
                link.addEventListener('click', function(evt) {
                    evt.preventDefault();
                    activate(i);
                });
            });

            activate(Math.max(0, Math.min(selected, links.length - 1)));
        });
    };

    DomLiteCollection.prototype.handsontable = function(arg) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (this.length === 0) return undefined;

        var results = [];
        this.each(function() {
            var el = this;
            var instance = el.__handsontableInstance;

            if (typeof arg === 'string') {
                if (!instance) {
                    results.push(undefined);
                    return;
                }
                if (arg === 'getInstance') {
                    results.push(instance);
                    return;
                }
                if (typeof instance[arg] === 'function') {
                    results.push(instance[arg].apply(instance, args));
                    return;
                }
                results.push(undefined);
                return;
            }

            if (!instance) {
                instance = new Handsontable(el, arg || {});
                el.__handsontableInstance = instance;
                $(el).data('handsontable', instance);
            } else if (arg && typeof arg === 'object') {
                instance.updateSettings(arg);
            }
            results.push(instance);
        });

        if (typeof arg === 'string') {
            return results.length > 1 ? results : results[0];
        }
        return this;
    };

    function $(selector, context) {
        if (typeof selector === 'function') {
            ready(selector);
            return new DomLiteCollection([]);
        }

        if (selector instanceof DomLiteCollection) {
            return selector;
        }

        if (selector == null) {
            return new DomLiteCollection([]);
        }

        if (typeof selector === 'string') {
            if (selector.trim().charAt(0) === '<') {
                return new DomLiteCollection(parseHtml(selector));
            }
            var root = normalizeContext(context);
            return new DomLiteCollection(Array.from(root.querySelectorAll(selector)));
        }

        if (selector === global || selector === document || selector === location) {
            return new DomLiteCollection([selector]);
        }

        return new DomLiteCollection(toArray(selector));
    }

    $.ajax = function(options) {
        var opts = options || {};
        var p = fetch(opts.url, { cache: opts.cache === false ? 'no-store' : 'default' })
            .then(function(resp) {
                if (!resp.ok) {
                    throw new Error('Request failed: ' + resp.status + ' ' + resp.statusText);
                }
                if (opts.dataType === 'json') {
                    return resp.json();
                }
                return resp.text();
            })
            .then(function(data) {
                if (typeof opts.success === 'function') {
                    opts.success(data);
                }
                return data;
            });

        return makeDeferred(p);
    };

    $.getJSON = function(url, callback) {
        return $.ajax({
            url: url,
            dataType: 'json',
            success: callback,
            cache: false
        });
    };

    $.inArray = function(value, array) {
        return array.indexOf(value);
    };

    $.isEmptyObject = function(obj) {
        if (!obj || typeof obj !== 'object') return true;
        return Object.keys(obj).length === 0;
    };

    $.type = function(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    };

    global.$ = $;
    global.jQuery = $;
})(window);