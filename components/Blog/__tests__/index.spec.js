import { Wrapper, shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Blog from '../index.vue';
import Feed from '~/components/Feed';
import Store from '~/store';
import { ActivityStore, ActivityActions } from '~/store/activity';

Wrapper.prototype.ref = function (id) {
	return this.find({ ref: id });
};

describe('Blog Component', () => {
	const EMPTY_FEED_TEXT = 'empty-blog-text';
	const PRELOADER = 'preloader';
	let params;
	let mocks;

	let localVue;
	let store;
	let wrapper;

	function initLocalVue () {
		localVue = createLocalVue();
		localVue.use(Vuex);

		store = new Vuex.Store(Store);
		store.commit('jSocket', {
			sendObj: jest.fn(),
		});
	}

	beforeEach(() => {
		initLocalVue();
		params = {
			id: 'any',
		};
		mocks = {
			$t: msg => msg,
			$route: {
				params,
			},
		};
		wrapper = shallowMount(Blog, {
			localVue,
			store,
			mocks,
		});
	});

	it('should render preloader', () => {
		expect(wrapper.ref(PRELOADER).exists()).toBe(true);
		expect(wrapper.ref(EMPTY_FEED_TEXT).exists()).toBe(false);
	});

	it('renders the correct message for empty Blog', () => {
		expect.assertions(2);
		store.state.activity.blog = [];

		expect(wrapper.ref(EMPTY_FEED_TEXT).exists()).toBe(true);
		expect(wrapper.ref(EMPTY_FEED_TEXT).text()).toBe('feed.isEmpty');
	});

	it('should fetch blog on created', () => {
		store.dispatch = jest.fn();

		shallowMount(Blog, {
			localVue,
			store,
			mocks,
		});

		expect(store.dispatch).toHaveBeenCalledWith(`${ActivityStore}/${ActivityActions.fetchItems}`, { type: 'blog', guid: params.id });
	});

	it('should fetch blog on loadMore event from Feed', () => {
		store.dispatch = jest.fn();

		shallowMount(Blog, {
			localVue,
			store,
			mocks,
		});
		wrapper.find(Feed).vm.$emit('loadMore');
		expect(store.dispatch).toHaveBeenCalledWith(`${ActivityStore}/${ActivityActions.fetchItems}`, { type: 'blog', guid: params.id });
	});
});
