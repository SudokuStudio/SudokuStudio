
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\svelte\Icon.svelte generated by Svelte v3.38.3 */

    const file$7 = "src\\svelte\\Icon.svelte";

    function create_fragment$c(ctx) {
    	let span;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", span_class_value = "icon icon-inline icon-c-clickable icon-" + /*icon*/ ctx[0]);
    			add_location(span, file$7, 3, 0, 47);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*icon*/ 1 && span_class_value !== (span_class_value = "icon icon-inline icon-c-clickable icon-" + /*icon*/ ctx[0])) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, []);
    	let { icon } = $$props;
    	const writable_props = ["icon"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    	};

    	$$self.$capture_state = () => ({ icon });

    	$$self.$inject_state = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [icon];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { icon: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[0] === undefined && !("icon" in props)) {
    			console.warn("<Icon> was created without expected prop 'icon'");
    		}
    	}

    	get icon() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\svelte\edit\ConstraintRow.svelte generated by Svelte v3.38.3 */
    const file$6 = "src\\svelte\\edit\\ConstraintRow.svelte";

    function create_fragment$b(ctx) {
    	let div2;
    	let div0;
    	let icon;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let current;
    	icon = new Icon({ props: { icon: "trash" }, $$inline: true });
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(icon.$$.fragment);
    			t0 = space();
    			t1 = text(/*name*/ ctx[0]);
    			t2 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "constraint-row-left svelte-1kmaedl");
    			add_location(div0, file$6, 5, 4, 116);
    			attr_dev(div1, "class", "constraint-row-right svelte-1kmaedl");
    			add_location(div1, file$6, 9, 4, 210);
    			attr_dev(div2, "class", "constraint-row svelte-1kmaedl");
    			add_location(div2, file$6, 4, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(icon, div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], !current ? -1 : dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(icon);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ConstraintRow", slots, ['default']);
    	let { name } = $$props;
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ConstraintRow> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Icon, name });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, $$scope, slots];
    }

    class ConstraintRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConstraintRow",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<ConstraintRow> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<ConstraintRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ConstraintRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\svelte\edit\ConstraintToggle.svelte generated by Svelte v3.38.3 */
    const file$5 = "src\\svelte\\edit\\ConstraintToggle.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let label;
    	let icon_1;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let input;
    	let current;
    	let mounted;
    	let dispose;

    	icon_1 = new Icon({
    			props: { icon: /*icon*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			create_component(icon_1.$$.fragment);
    			t0 = space();
    			span = element("span");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = space();
    			input = element("input");
    			attr_dev(span, "class", "sr-only");
    			add_location(span, file$5, 12, 8, 314);
    			attr_dev(label, "for", "toggle-" + ++counter);
    			attr_dev(label, "title", /*name*/ ctx[0]);
    			add_location(label, file$5, 10, 4, 236);
    			attr_dev(input, "id", "toggle-" + counter);
    			attr_dev(input, "type", "checkbox");
    			input.checked = /*checked*/ ctx[2];
    			add_location(input, file$5, 14, 4, 367);
    			attr_dev(div, "class", "constraint-toggle svelte-h67gfh");
    			add_location(div, file$5, 9, 0, 200);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			mount_component(icon_1, label, null);
    			append_dev(label, t0);
    			append_dev(label, span);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			append_dev(div, input);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const icon_1_changes = {};
    			if (dirty & /*icon*/ 2) icon_1_changes.icon = /*icon*/ ctx[1];
    			icon_1.$set(icon_1_changes);
    			if (!current || dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);

    			if (!current || dirty & /*name*/ 1) {
    				attr_dev(label, "title", /*name*/ ctx[0]);
    			}

    			if (!current || dirty & /*checked*/ 4) {
    				prop_dev(input, "checked", /*checked*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon_1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }
    let counter = 0;

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ConstraintToggle", slots, []);
    	let { name } = $$props;
    	let { icon } = $$props;
    	let { checked } = $$props;
    	const writable_props = ["name", "icon", "checked"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ConstraintToggle> was created with unknown prop '${key}'`);
    	});

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("checked" in $$props) $$invalidate(2, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({ counter, Icon, name, icon, checked });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("checked" in $$props) $$invalidate(2, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, icon, checked, input_handler];
    }

    class ConstraintToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { name: 0, icon: 1, checked: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConstraintToggle",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<ConstraintToggle> was created without expected prop 'name'");
    		}

    		if (/*icon*/ ctx[1] === undefined && !("icon" in props)) {
    			console.warn("<ConstraintToggle> was created without expected prop 'icon'");
    		}

    		if (/*checked*/ ctx[2] === undefined && !("checked" in props)) {
    			console.warn("<ConstraintToggle> was created without expected prop 'checked'");
    		}
    	}

    	get name() {
    		throw new Error("<ConstraintToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ConstraintToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<ConstraintToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<ConstraintToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<ConstraintToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<ConstraintToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\svelte\edit\constraint\Diagonal.svelte generated by Svelte v3.38.3 */

    // (6:0) <ConstraintRow name="Diagonals">
    function create_default_slot$5(ctx) {
    	let constrainttoggle0;
    	let t;
    	let constrainttoggle1;
    	let current;

    	constrainttoggle0 = new ConstraintToggle({
    			props: {
    				name: "Toggle Positive Diagonal",
    				icon: "positive-diagonal",
    				checked: /*value*/ ctx[0].positive
    			},
    			$$inline: true
    		});

    	constrainttoggle1 = new ConstraintToggle({
    			props: {
    				name: "Toggle Negative Diagonal",
    				icon: "negative-diagonal",
    				checked: /*value*/ ctx[0].negative
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(constrainttoggle0.$$.fragment);
    			t = space();
    			create_component(constrainttoggle1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(constrainttoggle0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(constrainttoggle1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const constrainttoggle0_changes = {};
    			if (dirty & /*value*/ 1) constrainttoggle0_changes.checked = /*value*/ ctx[0].positive;
    			constrainttoggle0.$set(constrainttoggle0_changes);
    			const constrainttoggle1_changes = {};
    			if (dirty & /*value*/ 1) constrainttoggle1_changes.checked = /*value*/ ctx[0].negative;
    			constrainttoggle1.$set(constrainttoggle1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constrainttoggle0.$$.fragment, local);
    			transition_in(constrainttoggle1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constrainttoggle0.$$.fragment, local);
    			transition_out(constrainttoggle1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constrainttoggle0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(constrainttoggle1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(6:0) <ConstraintRow name=\\\"Diagonals\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let constraintrow;
    	let current;

    	constraintrow = new ConstraintRow({
    			props: {
    				name: "Diagonals",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(constraintrow.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(constraintrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const constraintrow_changes = {};

    			if (dirty & /*$$scope, value*/ 3) {
    				constraintrow_changes.$$scope = { dirty, ctx };
    			}

    			constraintrow.$set(constraintrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constraintrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constraintrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constraintrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Diagonal", slots, []);
    	let { value } = $$props;
    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Diagonal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ ConstraintRow, ConstraintToggle, value });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value];
    }

    class Diagonal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Diagonal",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<Diagonal> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<Diagonal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Diagonal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\svelte\edit\constraint\DisjointGroups.svelte generated by Svelte v3.38.3 */

    // (6:0) <ConstraintRow name="Disjoint Groups">
    function create_default_slot$4(ctx) {
    	let constrainttoggle;
    	let current;

    	constrainttoggle = new ConstraintToggle({
    			props: {
    				name: "Toggle Disjoint Groups Constraint",
    				icon: "disjoint",
    				checked: /*value*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(constrainttoggle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(constrainttoggle, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const constrainttoggle_changes = {};
    			if (dirty & /*value*/ 1) constrainttoggle_changes.checked = /*value*/ ctx[0];
    			constrainttoggle.$set(constrainttoggle_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constrainttoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constrainttoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constrainttoggle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(6:0) <ConstraintRow name=\\\"Disjoint Groups\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let constraintrow;
    	let current;

    	constraintrow = new ConstraintRow({
    			props: {
    				name: "Disjoint Groups",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(constraintrow.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(constraintrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const constraintrow_changes = {};

    			if (dirty & /*$$scope, value*/ 3) {
    				constraintrow_changes.$$scope = { dirty, ctx };
    			}

    			constraintrow.$set(constraintrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constraintrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constraintrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constraintrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DisjointGroups", slots, []);
    	let { value } = $$props;
    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DisjointGroups> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ ConstraintRow, ConstraintToggle, value });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value];
    }

    class DisjointGroups extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DisjointGroups",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<DisjointGroups> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<DisjointGroups>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<DisjointGroups>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\svelte\edit\constraint\King.svelte generated by Svelte v3.38.3 */

    // (6:0) <ConstraintRow name="Antiking">
    function create_default_slot$3(ctx) {
    	let constrainttoggle;
    	let current;

    	constrainttoggle = new ConstraintToggle({
    			props: {
    				name: "Toggle Antiking Constraint",
    				icon: "king",
    				checked: /*value*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(constrainttoggle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(constrainttoggle, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const constrainttoggle_changes = {};
    			if (dirty & /*value*/ 1) constrainttoggle_changes.checked = /*value*/ ctx[0];
    			constrainttoggle.$set(constrainttoggle_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constrainttoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constrainttoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constrainttoggle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(6:0) <ConstraintRow name=\\\"Antiking\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let constraintrow;
    	let current;

    	constraintrow = new ConstraintRow({
    			props: {
    				name: "Antiking",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(constraintrow.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(constraintrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const constraintrow_changes = {};

    			if (dirty & /*$$scope, value*/ 3) {
    				constraintrow_changes.$$scope = { dirty, ctx };
    			}

    			constraintrow.$set(constraintrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constraintrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constraintrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constraintrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("King", slots, []);
    	let { value } = $$props;
    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<King> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ ConstraintRow, ConstraintToggle, value });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value];
    }

    class King extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "King",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<King> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<King>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<King>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\svelte\edit\constraint\Knight.svelte generated by Svelte v3.38.3 */

    // (6:0) <ConstraintRow name="Antiknight">
    function create_default_slot$2(ctx) {
    	let constrainttoggle;
    	let current;

    	constrainttoggle = new ConstraintToggle({
    			props: {
    				name: "Toggle Anitknight Constraint",
    				icon: "knight",
    				checked: /*value*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(constrainttoggle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(constrainttoggle, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const constrainttoggle_changes = {};
    			if (dirty & /*value*/ 1) constrainttoggle_changes.checked = /*value*/ ctx[0];
    			constrainttoggle.$set(constrainttoggle_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constrainttoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constrainttoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constrainttoggle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(6:0) <ConstraintRow name=\\\"Antiknight\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let constraintrow;
    	let current;

    	constraintrow = new ConstraintRow({
    			props: {
    				name: "Antiknight",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(constraintrow.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(constraintrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const constraintrow_changes = {};

    			if (dirty & /*$$scope, value*/ 3) {
    				constraintrow_changes.$$scope = { dirty, ctx };
    			}

    			constraintrow.$set(constraintrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constraintrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constraintrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constraintrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Knight", slots, []);
    	let { value } = $$props;
    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Knight> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ ConstraintRow, ConstraintToggle, value });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value];
    }

    class Knight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Knight",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<Knight> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<Knight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Knight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\svelte\edit\constraint\Nonconsecutive.svelte generated by Svelte v3.38.3 */

    // (6:0) <ConstraintRow name="Nonconsecutive">
    function create_default_slot$1(ctx) {
    	let constrainttoggle;
    	let current;

    	constrainttoggle = new ConstraintToggle({
    			props: {
    				name: "Toggle Nonconsecutive Constraint",
    				icon: "nonconsecutive",
    				checked: /*value*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(constrainttoggle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(constrainttoggle, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const constrainttoggle_changes = {};
    			if (dirty & /*value*/ 1) constrainttoggle_changes.checked = /*value*/ ctx[0];
    			constrainttoggle.$set(constrainttoggle_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constrainttoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constrainttoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constrainttoggle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(6:0) <ConstraintRow name=\\\"Nonconsecutive\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let constraintrow;
    	let current;

    	constraintrow = new ConstraintRow({
    			props: {
    				name: "Nonconsecutive",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(constraintrow.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(constraintrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const constraintrow_changes = {};

    			if (dirty & /*$$scope, value*/ 3) {
    				constraintrow_changes.$$scope = { dirty, ctx };
    			}

    			constraintrow.$set(constraintrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constraintrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constraintrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constraintrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nonconsecutive", slots, []);
    	let { value } = $$props;
    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nonconsecutive> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ ConstraintRow, ConstraintToggle, value });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value];
    }

    class Nonconsecutive extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nonconsecutive",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<Nonconsecutive> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<Nonconsecutive>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Nonconsecutive>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\svelte\edit\ConstraintList.svelte generated by Svelte v3.38.3 */
    const file$4 = "src\\svelte\\edit\\ConstraintList.svelte";

    function create_fragment$4(ctx) {
    	let ul;
    	let li0;
    	let diagonal;
    	let t0;
    	let li1;
    	let knight;
    	let t1;
    	let li2;
    	let king;
    	let t2;
    	let li3;
    	let disjointgroups;
    	let t3;
    	let li4;
    	let nonconsecutive;
    	let current;

    	diagonal = new Diagonal({
    			props: {
    				value: { positive: true, negative: false }
    			},
    			$$inline: true
    		});

    	knight = new Knight({ props: { value: false }, $$inline: true });
    	king = new King({ props: { value: false }, $$inline: true });
    	disjointgroups = new DisjointGroups({ props: { value: false }, $$inline: true });
    	nonconsecutive = new Nonconsecutive({ props: { value: false }, $$inline: true });

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			create_component(diagonal.$$.fragment);
    			t0 = space();
    			li1 = element("li");
    			create_component(knight.$$.fragment);
    			t1 = space();
    			li2 = element("li");
    			create_component(king.$$.fragment);
    			t2 = space();
    			li3 = element("li");
    			create_component(disjointgroups.$$.fragment);
    			t3 = space();
    			li4 = element("li");
    			create_component(nonconsecutive.$$.fragment);
    			add_location(li0, file$4, 10, 4, 395);
    			add_location(li1, file$4, 13, 4, 477);
    			add_location(li2, file$4, 16, 4, 529);
    			add_location(li3, file$4, 19, 4, 579);
    			add_location(li4, file$4, 22, 4, 639);
    			attr_dev(ul, "class", "nolist");
    			add_location(ul, file$4, 9, 0, 371);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			mount_component(diagonal, li0, null);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			mount_component(knight, li1, null);
    			append_dev(ul, t1);
    			append_dev(ul, li2);
    			mount_component(king, li2, null);
    			append_dev(ul, t2);
    			append_dev(ul, li3);
    			mount_component(disjointgroups, li3, null);
    			append_dev(ul, t3);
    			append_dev(ul, li4);
    			mount_component(nonconsecutive, li4, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(diagonal.$$.fragment, local);
    			transition_in(knight.$$.fragment, local);
    			transition_in(king.$$.fragment, local);
    			transition_in(disjointgroups.$$.fragment, local);
    			transition_in(nonconsecutive.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(diagonal.$$.fragment, local);
    			transition_out(knight.$$.fragment, local);
    			transition_out(king.$$.fragment, local);
    			transition_out(disjointgroups.$$.fragment, local);
    			transition_out(nonconsecutive.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_component(diagonal);
    			destroy_component(knight);
    			destroy_component(king);
    			destroy_component(disjointgroups);
    			destroy_component(nonconsecutive);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ConstraintList", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ConstraintList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Diagonal,
    		DisjointGroups,
    		King,
    		Knight,
    		Nonconsecutive
    	});

    	return [];
    }

    class ConstraintList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConstraintList",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\svelte\edit\EditSection.svelte generated by Svelte v3.38.3 */
    const file$3 = "src\\svelte\\edit\\EditSection.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h4;
    	let icon;
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	icon = new Icon({
    			props: { icon: "tree-menu-shown" },
    			$$inline: true
    		});

    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			create_component(icon.$$.fragment);
    			t0 = space();
    			t1 = text(/*title*/ ctx[0]);
    			t2 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(h4, "class", "section-title svelte-aoafhk");
    			add_location(h4, file$3, 5, 4, 94);
    			add_location(div, file$3, 4, 0, 84);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			mount_component(icon, h4, null);
    			append_dev(h4, t0);
    			append_dev(h4, t1);
    			append_dev(div, t2);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], !current ? -1 : dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EditSection", slots, ['default']);
    	let { title } = $$props;
    	const writable_props = ["title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, Icon });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, $$scope, slots];
    }

    class EditSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditSection",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<EditSection> was created without expected prop 'title'");
    		}
    	}

    	get title() {
    		throw new Error("<EditSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<EditSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function objectFromEntries(entries) {
        const obj = Object.create(null);
        for (const [key, val] of entries) {
            obj[key] = val;
        }
        return obj;
    }

    const WatchersKey = Symbol('watchers key');
    /// Same as Object.is except that null and undefined are considered equal.
    function isEq(a, b) {
        return (null == a && null == b) || Object.is(a, b);
    }
    /// StateManager provides an interface for updating and reacting to changes in data.
    /// Each instance stores a single JS object. Watchers can be assigned to react to changes
    /// in specified paths of the object. When updates are given to the StateManager, it will
    /// apply the changes and ensure all relevant watchers are called, and it will return a
    /// undo/redo diff to the caller.
    ///
    /// This is where the magic happens.
    class StateManager {
        constructor() {
            /// Map from each watcher to the paths it's watching.
            this._watchers = new Map();
            this._watcherTreeRoot = Object.create(null);
            this._data = undefined;
        }
        get(...path) {
            if (path.includes('/'))
                throw Error('Path cannot contain "/", split into varargs.');
            let target = this._data;
            while (target && path.length)
                target = target[path.shift()];
            return target;
        }
        watch(watcher, triggerNow, ...patterns) {
            let patternSet = this._watchers.get(watcher);
            if (null == patternSet) {
                patternSet = new Set();
                this._watchers.set(watcher, patternSet);
            }
            for (const pattern of patterns) {
                this._watchPattern(watcher, triggerNow, pattern);
            }
        }
        update(update) {
            if ('object' !== typeof update)
                throw Error(`Invalid update object: ${update}`);
            let changed = false;
            const redo = [];
            const undo = [];
            for (const [key, data] of Object.entries(update)) {
                if (0 >= key.length)
                    throw Error(`Update key cannot be empty.`);
                const segs = key.split('/');
                const { data: newData, redo: newRedo, undo: newUndo } = StateManager._updateInternal(this._data, data, segs, [], [this._watcherTreeRoot]);
                if (!isEq(this._data, newData)) {
                    changed = true;
                    this._data = newData;
                    redo.push(...newRedo);
                    undo.push(...newUndo);
                }
            }
            if (changed) {
                return {
                    redo: objectFromEntries(redo),
                    undo: objectFromEntries(undo),
                };
            }
            return null;
        }
        _watchPattern(watcher, triggerNow, pattern) {
            if (!pattern || 0 >= pattern.length) {
                throw Error(`Pattern cannot be empty: ${pattern}.`);
            }
            const segs = pattern.split('/');
            let watcherTree = this._watcherTreeRoot;
            for (const seg of segs) {
                if (!Object.prototype.hasOwnProperty.call(watcherTree, seg)) {
                    watcherTree[seg] = Object.create(null);
                }
                watcherTree = watcherTree[seg];
            }
            (watcherTree[WatchersKey] || (watcherTree[WatchersKey] = new Set())).add(watcher);
            if (triggerNow) {
                StateManager._triggerNow(this._data, segs, [], watcher);
            }
        }
        /// Triggers a newly added watcher.
        static _triggerNow(data, segs, path, watcher) {
            if (null == data)
                return;
            if (0 >= segs.length) {
                // Base case - call watcher.
                (watcher)(path, null, data);
                return;
            }
            if ('object' !== typeof data)
                return; // If segs is not empty we can ignore primitives.
            // Recurse.
            const [seg, ...restSegs] = segs;
            if ('*' === seg) {
                for (const [k, v] of Object.entries(data)) {
                    this._triggerNow(v, restSegs, [...path, k], watcher);
                }
            }
            else if (Object.prototype.hasOwnProperty.call(data, seg)) {
                this._triggerNow(data[seg], restSegs, [...path, seg], watcher);
            }
        }
        /// DATA - Current data we're looking at, traversed recursively. This will NOT be modified.
        /// UPDATE - New data used to update DATA. I.e. when SEGS is empty we return UPDATE. Portions of
        ///     this object (if it is an object) may/will be incorporated into the returned object so be
        ///     careful of side-effects (TODO?).
        /// SEGS - Remaining target segments for the update.
        /// PATH - Path of DATA relative to the root.
        /// WATCHER_TREES - WatcherTrees encountered at the current level, containing watchers for this DATA.
        /// DIFF - A Diff object in which the changes this update makes are written into. This will contain
        ///     pieces of DATA and UPDATE so be careful of side effects (TODO?).
        /// Returns - The replacement value for DATA, or DATA itself if no updates occured.
        ///
        /// Diff logic:
        /// 3 cases we care about:
        /// - Delete: First depth where data gets replaced with null.
        /// - Create: First depth where null gets replaced with update.
        /// - Replace: First depth where data gets replaced with update.
        /// Only trigger this at update-point level.
        static _updateInternal(data, update, segs, path, watcherTrees) {
            const atUpdateDepth = 0 >= segs.length;
            // These will be an object or null, so primtives are coerced to null.
            // This prevents trying to e.g. iterate strings as character array objects.
            const dataObj = 'object' === typeof data ? data : null;
            const updateObj = 'object' === typeof update ? update : null;
            const { data: newData, redo, undo } = (() => {
                if (atUpdateDepth) {
                    // At an update point!
                    if (null == dataObj && null == updateObj) {
                        // We've reached a pair of primitives, this is the base case.
                        return { data: update, undo: [], redo: [] }; // May be the same as data, or maybe not.
                    }
                    // Trigger update on every child key, not just one SEG.
                    const allKeys = new Set([
                        ...Object.keys(dataObj || {}),
                        ...Object.keys(updateObj || {}),
                    ]);
                    // Stores the changes (if any).
                    let dataUpdated = false;
                    const dataObjNew = Object.create(null);
                    const redo = [];
                    const undo = [];
                    // For child keys.
                    for (const key of allKeys) {
                        const innerData = dataObj && dataObj[key] || null;
                        const innerUpdate = updateObj && updateObj[key] || null;
                        const nextWatcherTrees = StateManager._nextWatcherTrees(key, watcherTrees);
                        // Recurse.
                        const { data: newInnerData, redo: innerRedo, undo: innerUndo } = StateManager._updateInternal(innerData, innerUpdate, [], [...path, key], nextWatcherTrees);
                        if (!isEq(innerData, newInnerData)) {
                            dataUpdated = true;
                            redo.push(...innerRedo);
                            undo.push(...innerUndo);
                            if (updateObj != null && Object.prototype.hasOwnProperty.call(updateObj, key)) {
                                // Only take the update if it came from UPDATE and therefore wasn't a delete.
                                dataObjNew[key] = newInnerData;
                            }
                        }
                    }
                    if (!dataUpdated) {
                        // No changes.
                        return { data, redo, undo };
                    }
                    // Yes changes.
                    if (0 >= Object.keys(dataObjNew).length) {
                        // If dataObjNew is empty then take the update itself.
                        return { data: update, redo, undo };
                    }
                    else {
                        // Otherwise create the object.
                        return {
                            data: Object.assign(Object.create(null), dataObj, dataObjNew),
                            redo, undo,
                        };
                    }
                }
                // Not at an update point, just traversing the SEGS.
                const [key, ...segsRest] = segs;
                const innerData = dataObj && dataObj[key] || null;
                // Do not change UPDATE... we are not at the updating depth yet.
                const nextWatcherTrees = StateManager._nextWatcherTrees(key, watcherTrees);
                // Recurse.
                const { data: newInnerData, redo, undo } = StateManager._updateInternal(innerData, update, segsRest, [...path, key], nextWatcherTrees);
                if (isEq(innerData, newInnerData)) {
                    // No changes.
                    return { data, redo, undo };
                }
                // Yes changes.
                return {
                    data: Object.assign(Object.create(null), dataObj, { [key]: newInnerData }),
                    redo, undo,
                };
            })();
            if (!isEq(data, newData)) {
                // if (0 < path.length) {
                //     if (redo && atUpdateDepth) redo[path.join('/')] = newData;
                //     if (undo) undo[path.join('/')] = data;
                // }
                {
                    if (null == data) {
                        if (null == newData) {
                            throw "N/A";
                        }
                        if ('object' === typeof newData) ;
                        else {
                            redo.length = 0;
                            redo.push([path.join('/'), newData]);
                            undo.length = 0;
                            undo.push([path.join('/'), null]);
                        }
                    }
                    else if ('object' === typeof data) {
                        if (null == newData) ;
                        else if ('object' === typeof newData) ;
                        else {
                            redo.length = 0;
                            redo.push([path.join('/'), newData]);
                            // (nested)
                        }
                    }
                    else {
                        // value
                        if (null == newData) {
                            redo.length = 0;
                            redo.push([path.join('/'), null]);
                            undo.length = 0;
                            undo.push([path.join('/'), data]);
                        }
                        else if ('object' === typeof newData) {
                            // (nested)
                            undo.length = 0;
                            undo.push([path.join('/'), data]);
                        }
                        else {
                            redo.length = 0;
                            redo.push([path.join('/'), null]);
                            undo.length = 0;
                            undo.push([path.join('/'), data]);
                        }
                    }
                }
                for (const watcherTree of watcherTrees) {
                    for (const watcher of watcherTree[WatchersKey] || []) {
                        (watcher)(path, data, newData);
                    }
                }
                return { data: newData, undo, redo };
            }
            return { data, undo, redo };
        }
        /// Given a list WATCHER_TREES get the next level down of watcher trees, corresponding to KEY.
        static _nextWatcherTrees(key, watcherTrees) {
            const nextTrees = [];
            for (const watcherTree of watcherTrees) {
                watcherTree['*'] && nextTrees.push(watcherTree['*']);
                watcherTree[key] && nextTrees.push(watcherTree[key]);
            }
            return nextTrees;
        }
    }

    const boardState = window.boardState = new StateManager();
    const globalConstraints = writable([]);
    const CONSTRAINT_COMPONENTS = {
        ['diagonal']: Diagonal,
        ['knight']: Knight,
        ['king']: King,
        ['disjointGroups']: DisjointGroups,
        ['consecutive']: Nonconsecutive,
    };
    boardState.update({
        grid: {
            width: 9,
            height: 9,
        },
        constraints: {
            '10800': {
                type: 'diagonal',
                value: {
                    positive: true,
                    negative: false,
                },
                meta: {
                    order: 0,
                },
            },
            '10090': {
                type: 'knight',
                value: false,
                meta: {
                    order: 1,
                },
            },
            '10100': {
                type: 'king',
                value: false,
                meta: {
                    order: 2,
                },
            },
            '10110': {
                type: 'disjointGroups',
                value: false,
                meta: {
                    order: 3,
                },
            },
            '10120': {
                type: 'consecutive',
                value: false,
                meta: {
                    order: 4,
                },
            },
        },
    });
    boardState.watch(([_constraints, constraintId], oldVal, newVal) => {
        if (null == oldVal) {
            const component = CONSTRAINT_COMPONENTS[newVal.type];
            globalConstraints.update(arr => {
                arr.push({
                    id: constraintId,
                    value: newVal.value,
                    component
                });
                return arr;
            });
        }
    }, true, 'constraints/*');

    /* src\svelte\edit\EditPanel.svelte generated by Svelte v3.38.3 */
    const file$2 = "src\\svelte\\edit\\EditPanel.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i].id;
    	child_ctx[2] = list[i].value;
    	child_ctx[3] = list[i].component;
    	return child_ctx;
    }

    // (10:8) <EditSection title="Solver Panel">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Nothing Here!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(10:8) <EditSection title=\\\"Solver Panel\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:12) {#each globalConstraintsList as { id: _, value, component }}
    function create_each_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*component*/ ctx[3];

    	function switch_props(ctx) {
    		return {
    			props: { value: /*value*/ ctx[2] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*globalConstraintsList*/ 1) switch_instance_changes.value = /*value*/ ctx[2];

    			if (switch_value !== (switch_value = /*component*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(16:12) {#each globalConstraintsList as { id: _, value, component }}",
    		ctx
    	});

    	return block;
    }

    // (15:8) <EditSection title="Global Constraints">
    function create_default_slot_3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*globalConstraintsList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*globalConstraintsList*/ 1) {
    				each_value = /*globalConstraintsList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(15:8) <EditSection title=\\\"Global Constraints\\\">",
    		ctx
    	});

    	return block;
    }

    // (22:8) <EditSection title="Global Constraints">
    function create_default_slot_2(ctx) {
    	let constraintlist;
    	let current;
    	constraintlist = new ConstraintList({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(constraintlist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(constraintlist, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constraintlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constraintlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constraintlist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(22:8) <EditSection title=\\\"Global Constraints\\\">",
    		ctx
    	});

    	return block;
    }

    // (27:8) <EditSection title="Local Constraints">
    function create_default_slot_1(ctx) {
    	let ul;
    	let li0;
    	let input0;
    	let t0;
    	let label0;
    	let t2;
    	let li1;
    	let input1;
    	let t3;
    	let label1;
    	let t5;
    	let li2;
    	let input2;
    	let t6;
    	let label2;
    	let t8;
    	let li3;
    	let input3;
    	let t9;
    	let label3;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			input0 = element("input");
    			t0 = space();
    			label0 = element("label");
    			label0.textContent = "Digit";
    			t2 = space();
    			li1 = element("li");
    			input1 = element("input");
    			t3 = space();
    			label1 = element("label");
    			label1.textContent = "Thermo";
    			t5 = space();
    			li2 = element("li");
    			input2 = element("input");
    			t6 = space();
    			label2 = element("label");
    			label2.textContent = "Arrow";
    			t8 = space();
    			li3 = element("li");
    			input3 = element("input");
    			t9 = space();
    			label3 = element("label");
    			label3.textContent = "Sandwich";
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "id", "digitTool");
    			attr_dev(input0, "name", "localConstraints");
    			input0.checked = true;
    			add_location(input0, file$2, 29, 20, 905);
    			attr_dev(label0, "for", "digitTool");
    			add_location(label0, file$2, 35, 20, 1111);
    			add_location(li0, file$2, 28, 16, 880);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "id", "thermoTool");
    			attr_dev(input1, "name", "localConstraints");
    			add_location(input1, file$2, 38, 20, 1213);
    			attr_dev(label1, "for", "thermoTool");
    			add_location(label1, file$2, 43, 20, 1388);
    			add_location(li1, file$2, 37, 16, 1188);
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "id", "arrowTool");
    			attr_dev(input2, "name", "localConstraints");
    			add_location(input2, file$2, 46, 20, 1492);
    			attr_dev(label2, "for", "arrowTool");
    			add_location(label2, file$2, 51, 20, 1666);
    			add_location(li2, file$2, 45, 16, 1467);
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "id", "sandwichTool");
    			attr_dev(input3, "name", "localConstraints");
    			add_location(input3, file$2, 54, 20, 1768);
    			attr_dev(label3, "for", "sandwichTool");
    			add_location(label3, file$2, 59, 20, 1945);
    			add_location(li3, file$2, 53, 16, 1743);
    			add_location(ul, file$2, 27, 12, 859);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, input0);
    			append_dev(li0, t0);
    			append_dev(li0, label0);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, input1);
    			append_dev(li1, t3);
    			append_dev(li1, label1);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    			append_dev(li2, input2);
    			append_dev(li2, t6);
    			append_dev(li2, label2);
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, input3);
    			append_dev(li3, t9);
    			append_dev(li3, label3);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(27:8) <EditSection title=\\\"Local Constraints\\\">",
    		ctx
    	});

    	return block;
    }

    // (66:8) <EditSection title="Cosmetic Tools">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Nothing Here!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(66:8) <EditSection title=\\\"Cosmetic Tools\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let ul;
    	let li0;
    	let editsection0;
    	let t0;
    	let li1;
    	let editsection1;
    	let t1;
    	let li2;
    	let editsection2;
    	let t2;
    	let li3;
    	let editsection3;
    	let t3;
    	let li4;
    	let editsection4;
    	let current;

    	editsection0 = new EditSection({
    			props: {
    				title: "Solver Panel",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	editsection1 = new EditSection({
    			props: {
    				title: "Global Constraints",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	editsection2 = new EditSection({
    			props: {
    				title: "Global Constraints",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	editsection3 = new EditSection({
    			props: {
    				title: "Local Constraints",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	editsection4 = new EditSection({
    			props: {
    				title: "Cosmetic Tools",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			create_component(editsection0.$$.fragment);
    			t0 = space();
    			li1 = element("li");
    			create_component(editsection1.$$.fragment);
    			t1 = space();
    			li2 = element("li");
    			create_component(editsection2.$$.fragment);
    			t2 = space();
    			li3 = element("li");
    			create_component(editsection3.$$.fragment);
    			t3 = space();
    			li4 = element("li");
    			create_component(editsection4.$$.fragment);
    			add_location(li0, file$2, 8, 4, 315);
    			add_location(li1, file$2, 13, 4, 426);
    			add_location(li2, file$2, 20, 4, 672);
    			add_location(li3, file$2, 25, 4, 794);
    			add_location(li4, file$2, 64, 4, 2067);
    			attr_dev(ul, "class", "nolist");
    			add_location(ul, file$2, 7, 0, 291);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			mount_component(editsection0, li0, null);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			mount_component(editsection1, li1, null);
    			append_dev(ul, t1);
    			append_dev(ul, li2);
    			mount_component(editsection2, li2, null);
    			append_dev(ul, t2);
    			append_dev(ul, li3);
    			mount_component(editsection3, li3, null);
    			append_dev(ul, t3);
    			append_dev(ul, li4);
    			mount_component(editsection4, li4, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const editsection0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				editsection0_changes.$$scope = { dirty, ctx };
    			}

    			editsection0.$set(editsection0_changes);
    			const editsection1_changes = {};

    			if (dirty & /*$$scope, globalConstraintsList*/ 65) {
    				editsection1_changes.$$scope = { dirty, ctx };
    			}

    			editsection1.$set(editsection1_changes);
    			const editsection2_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				editsection2_changes.$$scope = { dirty, ctx };
    			}

    			editsection2.$set(editsection2_changes);
    			const editsection3_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				editsection3_changes.$$scope = { dirty, ctx };
    			}

    			editsection3.$set(editsection3_changes);
    			const editsection4_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				editsection4_changes.$$scope = { dirty, ctx };
    			}

    			editsection4.$set(editsection4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editsection0.$$.fragment, local);
    			transition_in(editsection1.$$.fragment, local);
    			transition_in(editsection2.$$.fragment, local);
    			transition_in(editsection3.$$.fragment, local);
    			transition_in(editsection4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editsection0.$$.fragment, local);
    			transition_out(editsection1.$$.fragment, local);
    			transition_out(editsection2.$$.fragment, local);
    			transition_out(editsection3.$$.fragment, local);
    			transition_out(editsection4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_component(editsection0);
    			destroy_component(editsection1);
    			destroy_component(editsection2);
    			destroy_component(editsection3);
    			destroy_component(editsection4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EditPanel", slots, []);
    	
    	let globalConstraintsList = [];
    	globalConstraints.subscribe(value => $$invalidate(0, globalConstraintsList = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ConstraintList,
    		EditSection,
    		globalConstraints,
    		globalConstraintsList
    	});

    	$$self.$inject_state = $$props => {
    		if ("globalConstraintsList" in $$props) $$invalidate(0, globalConstraintsList = $$props.globalConstraintsList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [globalConstraintsList];
    }

    class EditPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditPanel",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\svelte\Header.svelte generated by Svelte v3.38.3 */

    const file$1 = "src\\svelte\\Header.svelte";

    function create_fragment$1(ctx) {
    	let div0;
    	let ul0;
    	let li0;
    	let t1;
    	let li1;
    	let t3;
    	let li2;
    	let t5;
    	let div2;
    	let h1;
    	let t7;
    	let div1;
    	let t9;
    	let div3;
    	let ul1;
    	let li3;
    	let t11;
    	let li4;
    	let t13;
    	let li5;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Solving/Setting";
    			t1 = space();
    			li1 = element("li");
    			li1.textContent = "New Grid";
    			t3 = space();
    			li2 = element("li");
    			li2.textContent = "Export";
    			t5 = space();
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Double Agent";
    			t7 = space();
    			div1 = element("div");
    			div1.textContent = "by echoes and TauCeti Deichmann";
    			t9 = space();
    			div3 = element("div");
    			ul1 = element("ul");
    			li3 = element("li");
    			li3.textContent = "Light/dark";
    			t11 = space();
    			li4 = element("li");
    			li4.textContent = "Help";
    			t13 = space();
    			li5 = element("li");
    			li5.textContent = "Settings";
    			add_location(li0, file$1, 2, 8, 71);
    			add_location(li1, file$1, 3, 8, 104);
    			add_location(li2, file$1, 4, 8, 130);
    			attr_dev(ul0, "class", "header-buttons left svelte-tt0eff");
    			add_location(ul0, file$1, 1, 4, 30);
    			attr_dev(div0, "class", "header-left svelte-tt0eff");
    			add_location(div0, file$1, 0, 0, 0);
    			attr_dev(h1, "class", "svelte-tt0eff");
    			add_location(h1, file$1, 8, 4, 195);
    			attr_dev(div1, "class", "setter svelte-tt0eff");
    			add_location(div1, file$1, 9, 4, 221);
    			attr_dev(div2, "class", "header-center svelte-tt0eff");
    			add_location(div2, file$1, 7, 0, 163);
    			add_location(li3, file$1, 13, 8, 359);
    			add_location(li4, file$1, 14, 8, 387);
    			add_location(li5, file$1, 15, 8, 409);
    			attr_dev(ul1, "class", "header-buttons right svelte-tt0eff");
    			add_location(ul1, file$1, 12, 4, 317);
    			attr_dev(div3, "class", "header-right svelte-tt0eff");
    			add_location(div3, file$1, 11, 0, 286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t1);
    			append_dev(ul0, li1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li2);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, ul1);
    			append_dev(ul1, li3);
    			append_dev(ul1, t11);
    			append_dev(ul1, li4);
    			append_dev(ul1, t13);
    			append_dev(ul1, li5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.3 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let header1;
    	let div1;
    	let div0;
    	let header0;
    	let t0;
    	let main;
    	let div6;
    	let div5;
    	let div2;
    	let editpanel;
    	let t1;
    	let div3;
    	let img;
    	let img_src_value;
    	let t2;
    	let div4;
    	let t4;
    	let footer;
    	let current;
    	header0 = new Header({ $$inline: true });
    	editpanel = new EditPanel({ $$inline: true });

    	const block = {
    		c: function create() {
    			header1 = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(header0.$$.fragment);
    			t0 = space();
    			main = element("main");
    			div6 = element("div");
    			div5 = element("div");
    			div2 = element("div");
    			create_component(editpanel.$$.fragment);
    			t1 = space();
    			div3 = element("div");
    			img = element("img");
    			t2 = space();
    			div4 = element("div");
    			div4.textContent = "RIGHT PANEL";
    			t4 = space();
    			footer = element("footer");
    			footer.textContent = "SudokuStudio";
    			attr_dev(div0, "class", "content-row");
    			add_location(div0, file, 6, 8, 175);
    			attr_dev(div1, "class", "content");
    			add_location(div1, file, 5, 4, 145);
    			attr_dev(header1, "class", "svelte-q96pc2");
    			add_location(header1, file, 4, 0, 132);
    			attr_dev(div2, "class", "left-panel svelte-q96pc2");
    			add_location(div2, file, 14, 12, 339);
    			if (img.src !== (img_src_value = "svg/example-grid.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Sudoku Grid");
    			add_location(img, file, 18, 16, 468);
    			attr_dev(div3, "class", "center-panel svelte-q96pc2");
    			add_location(div3, file, 17, 12, 425);
    			attr_dev(div4, "class", "right-panel svelte-q96pc2");
    			add_location(div4, file, 20, 12, 552);
    			attr_dev(div5, "class", "content-row svelte-q96pc2");
    			add_location(div5, file, 13, 8, 301);
    			attr_dev(div6, "class", "content svelte-q96pc2");
    			add_location(div6, file, 12, 4, 271);
    			attr_dev(main, "class", "svelte-q96pc2");
    			add_location(main, file, 11, 0, 260);
    			attr_dev(footer, "class", "svelte-q96pc2");
    			add_location(footer, file, 24, 0, 629);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header1, anchor);
    			append_dev(header1, div1);
    			append_dev(div1, div0);
    			mount_component(header0, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			mount_component(editpanel, div2, null);
    			append_dev(div5, t1);
    			append_dev(div5, div3);
    			append_dev(div3, img);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, footer, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header0.$$.fragment, local);
    			transition_in(editpanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header0.$$.fragment, local);
    			transition_out(editpanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header1);
    			destroy_component(header0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(editpanel);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ EditPanel, Header });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
