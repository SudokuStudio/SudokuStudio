
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
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
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

    /* src\components\Icon.svelte generated by Svelte v3.38.3 */

    const file$5 = "src\\components\\Icon.svelte";

    function create_fragment$5(ctx) {
    	let span;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", span_class_value = "icon icon-inline icon-c-clickable icon-" + /*icon*/ ctx[0]);
    			add_location(span, file$5, 3, 0, 47);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { icon: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$5.name
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

    /* src\components\ConstraintList.svelte generated by Svelte v3.38.3 */
    const file$4 = "src\\components\\ConstraintList.svelte";

    function create_fragment$4(ctx) {
    	let ul;
    	let li0;
    	let div4;
    	let div0;
    	let icon0;
    	let t0;
    	let t1;
    	let div3;
    	let div1;
    	let label0;
    	let icon1;
    	let t2;
    	let span0;
    	let t4;
    	let input0;
    	let t5;
    	let div2;
    	let label1;
    	let icon2;
    	let t6;
    	let span1;
    	let t8;
    	let input1;
    	let t9;
    	let li1;
    	let div8;
    	let div5;
    	let icon3;
    	let t10;
    	let span2;
    	let t11;
    	let div7;
    	let div6;
    	let label2;
    	let icon4;
    	let t12;
    	let span3;
    	let t14;
    	let input2;
    	let t15;
    	let li2;
    	let div12;
    	let div9;
    	let icon5;
    	let t16;
    	let span4;
    	let t17;
    	let div11;
    	let div10;
    	let label3;
    	let icon6;
    	let t18;
    	let span5;
    	let t20;
    	let input3;
    	let t21;
    	let li3;
    	let div16;
    	let div13;
    	let icon7;
    	let t22;
    	let span6;
    	let t23;
    	let div15;
    	let div14;
    	let label4;
    	let icon8;
    	let t24;
    	let span7;
    	let t26;
    	let input4;
    	let t27;
    	let li4;
    	let div20;
    	let div17;
    	let icon9;
    	let t28;
    	let span8;
    	let t29;
    	let div19;
    	let div18;
    	let label5;
    	let icon10;
    	let t30;
    	let span9;
    	let t32;
    	let input5;
    	let current;
    	icon0 = new Icon({ props: { icon: "trash" }, $$inline: true });

    	icon1 = new Icon({
    			props: { icon: "positive-diagonal" },
    			$$inline: true
    		});

    	icon2 = new Icon({
    			props: { icon: "negative-diagonal" },
    			$$inline: true
    		});

    	icon3 = new Icon({ props: { icon: "trash" }, $$inline: true });

    	icon4 = new Icon({
    			props: { icon: "knight" },
    			$$inline: true
    		});

    	icon5 = new Icon({ props: { icon: "trash" }, $$inline: true });
    	icon6 = new Icon({ props: { icon: "king" }, $$inline: true });
    	icon7 = new Icon({ props: { icon: "trash" }, $$inline: true });

    	icon8 = new Icon({
    			props: { icon: "disjoint" },
    			$$inline: true
    		});

    	icon9 = new Icon({ props: { icon: "trash" }, $$inline: true });

    	icon10 = new Icon({
    			props: { icon: "consec" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			div4 = element("div");
    			div0 = element("div");
    			create_component(icon0.$$.fragment);
    			t0 = text("\n                Diagonals");
    			t1 = space();
    			div3 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			create_component(icon1.$$.fragment);
    			t2 = space();
    			span0 = element("span");
    			span0.textContent = "Positive Diagonal\n                            Constraint";
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			div2 = element("div");
    			label1 = element("label");
    			create_component(icon2.$$.fragment);
    			t6 = space();
    			span1 = element("span");
    			span1.textContent = "Negative Diagonal\n                            Constraint";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			li1 = element("li");
    			div8 = element("div");
    			div5 = element("div");
    			create_component(icon3.$$.fragment);
    			t10 = text("\n                Antiknight\n                ");
    			span2 = element("span");
    			t11 = space();
    			div7 = element("div");
    			div6 = element("div");
    			label2 = element("label");
    			create_component(icon4.$$.fragment);
    			t12 = space();
    			span3 = element("span");
    			span3.textContent = "Antiknight Constraint";
    			t14 = space();
    			input2 = element("input");
    			t15 = space();
    			li2 = element("li");
    			div12 = element("div");
    			div9 = element("div");
    			create_component(icon5.$$.fragment);
    			t16 = text("\n                Antiking\n                ");
    			span4 = element("span");
    			t17 = space();
    			div11 = element("div");
    			div10 = element("div");
    			label3 = element("label");
    			create_component(icon6.$$.fragment);
    			t18 = space();
    			span5 = element("span");
    			span5.textContent = "Antiking Constraint";
    			t20 = space();
    			input3 = element("input");
    			t21 = space();
    			li3 = element("li");
    			div16 = element("div");
    			div13 = element("div");
    			create_component(icon7.$$.fragment);
    			t22 = text("\n                Disjoint Groups\n                ");
    			span6 = element("span");
    			t23 = space();
    			div15 = element("div");
    			div14 = element("div");
    			label4 = element("label");
    			create_component(icon8.$$.fragment);
    			t24 = space();
    			span7 = element("span");
    			span7.textContent = "Disjoin Groups Constraint";
    			t26 = space();
    			input4 = element("input");
    			t27 = space();
    			li4 = element("li");
    			div20 = element("div");
    			div17 = element("div");
    			create_component(icon9.$$.fragment);
    			t28 = text("\n                Nonconsecutive\n                ");
    			span8 = element("span");
    			t29 = space();
    			div19 = element("div");
    			div18 = element("div");
    			label5 = element("label");
    			create_component(icon10.$$.fragment);
    			t30 = space();
    			span9 = element("span");
    			span9.textContent = "Nonconsecutive Constraint";
    			t32 = space();
    			input5 = element("input");
    			attr_dev(div0, "class", "constraint-row-left svelte-71bj8t");
    			add_location(div0, file$4, 8, 12, 155);
    			attr_dev(span0, "class", "sr-only");
    			add_location(span0, file$4, 18, 24, 561);
    			attr_dev(label0, "for", "constraint-diagonal-positive");
    			add_location(label0, file$4, 14, 20, 391);
    			attr_dev(input0, "id", "constraint-diagonal-positive");
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "name", "constraint-diagonal-positive");
    			add_location(input0, file$4, 23, 20, 750);
    			attr_dev(div1, "class", "constraint-iconbutton svelte-71bj8t");
    			add_location(div1, file$4, 13, 16, 335);
    			attr_dev(span1, "class", "sr-only");
    			add_location(span1, file$4, 34, 24, 1203);
    			attr_dev(label1, "for", "constraint-diagonal-negative");
    			add_location(label1, file$4, 30, 20, 1033);
    			attr_dev(input1, "id", "constraint-diagonal-negative");
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "name", "constraint-diagonal-negative");
    			add_location(input1, file$4, 39, 20, 1392);
    			attr_dev(div2, "class", "constraint-iconbutton svelte-71bj8t");
    			add_location(div2, file$4, 29, 16, 977);
    			attr_dev(div3, "class", "constraint-row-right svelte-71bj8t");
    			add_location(div3, file$4, 12, 12, 284);
    			attr_dev(div4, "class", "constraint-row svelte-71bj8t");
    			add_location(div4, file$4, 7, 8, 114);
    			add_location(li0, file$4, 6, 4, 101);
    			attr_dev(span2, "class", "icon icon-inline icon-c-warning icon-warning");
    			add_location(span2, file$4, 54, 16, 1844);
    			attr_dev(div5, "class", "constraint-row-left svelte-71bj8t");
    			add_location(div5, file$4, 51, 12, 1729);
    			attr_dev(span3, "class", "sr-only");
    			add_location(span3, file$4, 62, 24, 2183);
    			attr_dev(label2, "for", "constraint-knight");
    			add_location(label2, file$4, 60, 20, 2080);
    			attr_dev(input2, "id", "constraint-knight");
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "name", "constraint-knight");
    			add_location(input2, file$4, 66, 20, 2337);
    			attr_dev(div6, "class", "constraint-iconbutton svelte-71bj8t");
    			add_location(div6, file$4, 59, 16, 2024);
    			attr_dev(div7, "class", "constraint-row-right svelte-71bj8t");
    			add_location(div7, file$4, 58, 12, 1973);
    			attr_dev(div8, "class", "constraint-row svelte-71bj8t");
    			add_location(div8, file$4, 50, 8, 1688);
    			add_location(li1, file$4, 49, 4, 1675);
    			attr_dev(span4, "class", "icon icon-inline icon-c-warning icon-warning");
    			add_location(span4, file$4, 81, 16, 2763);
    			attr_dev(div9, "class", "constraint-row-left svelte-71bj8t");
    			add_location(div9, file$4, 78, 12, 2650);
    			attr_dev(span5, "class", "sr-only");
    			add_location(span5, file$4, 89, 24, 3098);
    			attr_dev(label3, "for", "constraint-king");
    			add_location(label3, file$4, 87, 20, 2999);
    			attr_dev(input3, "id", "constraint-king");
    			attr_dev(input3, "type", "checkbox");
    			attr_dev(input3, "name", "constraint-king");
    			add_location(input3, file$4, 93, 20, 3250);
    			attr_dev(div10, "class", "constraint-iconbutton svelte-71bj8t");
    			add_location(div10, file$4, 86, 16, 2943);
    			attr_dev(div11, "class", "constraint-row-right svelte-71bj8t");
    			add_location(div11, file$4, 85, 12, 2892);
    			attr_dev(div12, "class", "constraint-row svelte-71bj8t");
    			add_location(div12, file$4, 77, 8, 2609);
    			add_location(li2, file$4, 76, 4, 2596);
    			attr_dev(span6, "class", "icon icon-inline icon-c-warning icon-warning");
    			add_location(span6, file$4, 108, 16, 3686);
    			attr_dev(div13, "class", "constraint-row-left svelte-71bj8t");
    			add_location(div13, file$4, 105, 12, 3566);
    			attr_dev(span7, "class", "sr-only");
    			add_location(span7, file$4, 116, 24, 4029);
    			attr_dev(label4, "for", "constraint-disjoint");
    			add_location(label4, file$4, 114, 20, 3922);
    			attr_dev(input4, "id", "constraint-disjoint");
    			attr_dev(input4, "type", "checkbox");
    			attr_dev(input4, "name", "constraint-disjoint");
    			add_location(input4, file$4, 120, 20, 4187);
    			attr_dev(div14, "class", "constraint-iconbutton svelte-71bj8t");
    			add_location(div14, file$4, 113, 16, 3866);
    			attr_dev(div15, "class", "constraint-row-right svelte-71bj8t");
    			add_location(div15, file$4, 112, 12, 3815);
    			attr_dev(div16, "class", "constraint-row svelte-71bj8t");
    			add_location(div16, file$4, 104, 8, 3525);
    			add_location(li3, file$4, 103, 4, 3512);
    			attr_dev(span8, "class", "icon icon-inline icon-c-warning icon-warning");
    			add_location(span8, file$4, 135, 16, 4629);
    			attr_dev(div17, "class", "constraint-row-left svelte-71bj8t");
    			add_location(div17, file$4, 132, 12, 4510);
    			attr_dev(span9, "class", "sr-only");
    			add_location(span9, file$4, 143, 24, 4968);
    			attr_dev(label5, "for", "constraint-consec");
    			add_location(label5, file$4, 141, 20, 4865);
    			attr_dev(input5, "id", "constraint-consec");
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "name", "constraint-consec");
    			add_location(input5, file$4, 147, 20, 5126);
    			attr_dev(div18, "class", "constraint-iconbutton svelte-71bj8t");
    			add_location(div18, file$4, 140, 16, 4809);
    			attr_dev(div19, "class", "constraint-row-right svelte-71bj8t");
    			add_location(div19, file$4, 139, 12, 4758);
    			attr_dev(div20, "class", "constraint-row svelte-71bj8t");
    			add_location(div20, file$4, 131, 8, 4469);
    			add_location(li4, file$4, 130, 4, 4456);
    			attr_dev(ul, "class", "nolist");
    			add_location(ul, file$4, 4, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, div4);
    			append_dev(div4, div0);
    			mount_component(icon0, div0, null);
    			append_dev(div0, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, label0);
    			mount_component(icon1, label0, null);
    			append_dev(label0, t2);
    			append_dev(label0, span0);
    			append_dev(div1, t4);
    			append_dev(div1, input0);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, label1);
    			mount_component(icon2, label1, null);
    			append_dev(label1, t6);
    			append_dev(label1, span1);
    			append_dev(div2, t8);
    			append_dev(div2, input1);
    			append_dev(ul, t9);
    			append_dev(ul, li1);
    			append_dev(li1, div8);
    			append_dev(div8, div5);
    			mount_component(icon3, div5, null);
    			append_dev(div5, t10);
    			append_dev(div5, span2);
    			append_dev(div8, t11);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, label2);
    			mount_component(icon4, label2, null);
    			append_dev(label2, t12);
    			append_dev(label2, span3);
    			append_dev(div6, t14);
    			append_dev(div6, input2);
    			append_dev(ul, t15);
    			append_dev(ul, li2);
    			append_dev(li2, div12);
    			append_dev(div12, div9);
    			mount_component(icon5, div9, null);
    			append_dev(div9, t16);
    			append_dev(div9, span4);
    			append_dev(div12, t17);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, label3);
    			mount_component(icon6, label3, null);
    			append_dev(label3, t18);
    			append_dev(label3, span5);
    			append_dev(div10, t20);
    			append_dev(div10, input3);
    			append_dev(ul, t21);
    			append_dev(ul, li3);
    			append_dev(li3, div16);
    			append_dev(div16, div13);
    			mount_component(icon7, div13, null);
    			append_dev(div13, t22);
    			append_dev(div13, span6);
    			append_dev(div16, t23);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, label4);
    			mount_component(icon8, label4, null);
    			append_dev(label4, t24);
    			append_dev(label4, span7);
    			append_dev(div14, t26);
    			append_dev(div14, input4);
    			append_dev(ul, t27);
    			append_dev(ul, li4);
    			append_dev(li4, div20);
    			append_dev(div20, div17);
    			mount_component(icon9, div17, null);
    			append_dev(div17, t28);
    			append_dev(div17, span8);
    			append_dev(div20, t29);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, label5);
    			mount_component(icon10, label5, null);
    			append_dev(label5, t30);
    			append_dev(label5, span9);
    			append_dev(div18, t32);
    			append_dev(div18, input5);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			transition_in(icon2.$$.fragment, local);
    			transition_in(icon3.$$.fragment, local);
    			transition_in(icon4.$$.fragment, local);
    			transition_in(icon5.$$.fragment, local);
    			transition_in(icon6.$$.fragment, local);
    			transition_in(icon7.$$.fragment, local);
    			transition_in(icon8.$$.fragment, local);
    			transition_in(icon9.$$.fragment, local);
    			transition_in(icon10.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			transition_out(icon2.$$.fragment, local);
    			transition_out(icon3.$$.fragment, local);
    			transition_out(icon4.$$.fragment, local);
    			transition_out(icon5.$$.fragment, local);
    			transition_out(icon6.$$.fragment, local);
    			transition_out(icon7.$$.fragment, local);
    			transition_out(icon8.$$.fragment, local);
    			transition_out(icon9.$$.fragment, local);
    			transition_out(icon10.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			destroy_component(icon2);
    			destroy_component(icon3);
    			destroy_component(icon4);
    			destroy_component(icon5);
    			destroy_component(icon6);
    			destroy_component(icon7);
    			destroy_component(icon8);
    			destroy_component(icon9);
    			destroy_component(icon10);
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

    	$$self.$capture_state = () => ({ Icon });
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

    /* src\components\EditSection.svelte generated by Svelte v3.38.3 */
    const file$3 = "src\\components\\EditSection.svelte";

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
    			add_location(h4, file$3, 5, 4, 93);
    			add_location(div, file$3, 4, 0, 83);
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

    /* src\components\EditPanel.svelte generated by Svelte v3.38.3 */
    const file$2 = "src\\components\\EditPanel.svelte";

    // (9:8) <EditSection title="Solver Panel">
    function create_default_slot_1(ctx) {
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(9:8) <EditSection title=\\\"Solver Panel\\\">",
    		ctx
    	});

    	return block;
    }

    // (14:8) <EditSection title="Global Constraints">
    function create_default_slot(ctx) {
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(14:8) <EditSection title=\\\"Global Constraints\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let ul1;
    	let li0;
    	let editsection0;
    	let t0;
    	let li1;
    	let editsection1;
    	let t1;
    	let li6;
    	let h40;
    	let icon0;
    	let t2;
    	let t3;
    	let ul0;
    	let li2;
    	let input0;
    	let t4;
    	let label0;
    	let t6;
    	let li3;
    	let input1;
    	let t7;
    	let label1;
    	let t9;
    	let li4;
    	let input2;
    	let t10;
    	let label2;
    	let t12;
    	let li5;
    	let input3;
    	let t13;
    	let label3;
    	let t15;
    	let li7;
    	let h41;
    	let icon1;
    	let t16;
    	let current;

    	editsection0 = new EditSection({
    			props: {
    				title: "Solver Panel",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	editsection1 = new EditSection({
    			props: {
    				title: "Global Constraints",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	icon0 = new Icon({
    			props: { icon: "tree-menu-shown" },
    			$$inline: true
    		});

    	icon1 = new Icon({
    			props: { icon: "tree-menu-hidden" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			ul1 = element("ul");
    			li0 = element("li");
    			create_component(editsection0.$$.fragment);
    			t0 = space();
    			li1 = element("li");
    			create_component(editsection1.$$.fragment);
    			t1 = space();
    			li6 = element("li");
    			h40 = element("h4");
    			create_component(icon0.$$.fragment);
    			t2 = text("\n            Local Constraints");
    			t3 = space();
    			ul0 = element("ul");
    			li2 = element("li");
    			input0 = element("input");
    			t4 = space();
    			label0 = element("label");
    			label0.textContent = "Digit";
    			t6 = space();
    			li3 = element("li");
    			input1 = element("input");
    			t7 = space();
    			label1 = element("label");
    			label1.textContent = "Thermo";
    			t9 = space();
    			li4 = element("li");
    			input2 = element("input");
    			t10 = space();
    			label2 = element("label");
    			label2.textContent = "Arrow";
    			t12 = space();
    			li5 = element("li");
    			input3 = element("input");
    			t13 = space();
    			label3 = element("label");
    			label3.textContent = "Sandwich";
    			t15 = space();
    			li7 = element("li");
    			h41 = element("h4");
    			create_component(icon1.$$.fragment);
    			t16 = text("\n            Cosmetic Tools");
    			add_location(li0, file$2, 7, 4, 180);
    			add_location(li1, file$2, 12, 4, 291);
    			attr_dev(h40, "class", "section-title");
    			add_location(h40, file$2, 18, 8, 426);
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "id", "digitTool");
    			attr_dev(input0, "name", "localConstraints");
    			input0.checked = true;
    			add_location(input0, file$2, 24, 16, 587);
    			attr_dev(label0, "for", "digitTool");
    			add_location(label0, file$2, 30, 16, 769);
    			add_location(li2, file$2, 23, 12, 566);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "id", "thermoTool");
    			attr_dev(input1, "name", "localConstraints");
    			add_location(input1, file$2, 33, 16, 859);
    			attr_dev(label1, "for", "thermoTool");
    			add_location(label1, file$2, 38, 16, 1014);
    			add_location(li3, file$2, 32, 12, 838);
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "id", "arrowTool");
    			attr_dev(input2, "name", "localConstraints");
    			add_location(input2, file$2, 41, 16, 1106);
    			attr_dev(label2, "for", "arrowTool");
    			add_location(label2, file$2, 46, 16, 1260);
    			add_location(li4, file$2, 40, 12, 1085);
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "id", "sandwichTool");
    			attr_dev(input3, "name", "localConstraints");
    			add_location(input3, file$2, 49, 16, 1350);
    			attr_dev(label3, "for", "sandwichTool");
    			add_location(label3, file$2, 54, 16, 1507);
    			add_location(li5, file$2, 48, 12, 1329);
    			add_location(ul0, file$2, 22, 8, 549);
    			add_location(li6, file$2, 17, 4, 413);
    			attr_dev(h41, "class", "section-title");
    			add_location(h41, file$2, 59, 8, 1611);
    			add_location(li7, file$2, 58, 4, 1598);
    			attr_dev(ul1, "class", "nolist");
    			add_location(ul1, file$2, 6, 0, 156);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li0);
    			mount_component(editsection0, li0, null);
    			append_dev(ul1, t0);
    			append_dev(ul1, li1);
    			mount_component(editsection1, li1, null);
    			append_dev(ul1, t1);
    			append_dev(ul1, li6);
    			append_dev(li6, h40);
    			mount_component(icon0, h40, null);
    			append_dev(h40, t2);
    			append_dev(li6, t3);
    			append_dev(li6, ul0);
    			append_dev(ul0, li2);
    			append_dev(li2, input0);
    			append_dev(li2, t4);
    			append_dev(li2, label0);
    			append_dev(ul0, t6);
    			append_dev(ul0, li3);
    			append_dev(li3, input1);
    			append_dev(li3, t7);
    			append_dev(li3, label1);
    			append_dev(ul0, t9);
    			append_dev(ul0, li4);
    			append_dev(li4, input2);
    			append_dev(li4, t10);
    			append_dev(li4, label2);
    			append_dev(ul0, t12);
    			append_dev(ul0, li5);
    			append_dev(li5, input3);
    			append_dev(li5, t13);
    			append_dev(li5, label3);
    			append_dev(ul1, t15);
    			append_dev(ul1, li7);
    			append_dev(li7, h41);
    			mount_component(icon1, h41, null);
    			append_dev(h41, t16);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const editsection0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				editsection0_changes.$$scope = { dirty, ctx };
    			}

    			editsection0.$set(editsection0_changes);
    			const editsection1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				editsection1_changes.$$scope = { dirty, ctx };
    			}

    			editsection1.$set(editsection1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editsection0.$$.fragment, local);
    			transition_in(editsection1.$$.fragment, local);
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editsection0.$$.fragment, local);
    			transition_out(editsection1.$$.fragment, local);
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul1);
    			destroy_component(editsection0);
    			destroy_component(editsection1);
    			destroy_component(icon0);
    			destroy_component(icon1);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ConstraintList, EditSection, Icon });
    	return [];
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

    /* src\components\Header.svelte generated by Svelte v3.38.3 */

    const file$1 = "src\\components\\Header.svelte";

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
    			add_location(div0, file, 6, 8, 178);
    			attr_dev(div1, "class", "content");
    			add_location(div1, file, 5, 4, 148);
    			attr_dev(header1, "class", "svelte-q96pc2");
    			add_location(header1, file, 4, 0, 135);
    			attr_dev(div2, "class", "left-panel svelte-q96pc2");
    			add_location(div2, file, 14, 12, 342);
    			if (img.src !== (img_src_value = "svg/example-grid.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Sudoku Grid");
    			add_location(img, file, 18, 16, 471);
    			attr_dev(div3, "class", "center-panel svelte-q96pc2");
    			add_location(div3, file, 17, 12, 428);
    			attr_dev(div4, "class", "right-panel svelte-q96pc2");
    			add_location(div4, file, 20, 12, 555);
    			attr_dev(div5, "class", "content-row svelte-q96pc2");
    			add_location(div5, file, 13, 8, 304);
    			attr_dev(div6, "class", "content svelte-q96pc2");
    			add_location(div6, file, 12, 4, 274);
    			attr_dev(main, "class", "svelte-q96pc2");
    			add_location(main, file, 11, 0, 263);
    			attr_dev(footer, "class", "svelte-q96pc2");
    			add_location(footer, file, 24, 0, 632);
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
