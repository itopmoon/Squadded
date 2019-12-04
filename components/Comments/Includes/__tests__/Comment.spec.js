import { Wrapper, shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Comment from '../Comment.vue';
import PopMenu from '../PopMenu.vue';
import { aDefaultSingleItemMsgBuilder } from '~/test/feed.item.mock';
import Store from '~/store';
import { commentMockBuilder } from '~/test/comment.mock';

const mocks = {
	$t: msg => msg,
	$tc: msg => msg,
};

Wrapper.prototype.ref = function (id) {
	return this.find({ ref: id });
};

export const factory = (byMe) => {
	const comment = commentMockBuilder()
		.withByMe(byMe)
		.get();

	const localVue = createLocalVue();
	localVue.use(Vuex);
	const store = new Vuex.Store(Store);

	return shallowMount(Comment, {
		mocks,
		localVue,
		propsData: {
			comment,
		},
		store,
	});
};

describe('Post comment', () => {
	const COMMENT_AUTHOR_USER_LINK = 'comment-author-user-link';
	const COMMENT_AUTHOR_NAME_USER_LINK = 'comment-author-name-user-link';
	const COMMENT_TEXT_ELEMENT = 'comment-text';
	let wrapper;

	function initLocalVue () {
		const post = aDefaultSingleItemMsgBuilder().withGUID().withComment().get();

		wrapper = shallowMount(Comment, {
			mocks,
			propsData: {
				comment: post.comments.messages[0],
			},
		});
	}

	beforeEach(() => {
		initLocalVue();
	});

	it('should have user links', () => {
		expect(wrapper.ref(COMMENT_AUTHOR_USER_LINK).exists()).toBe(true);
		expect(wrapper.ref(COMMENT_AUTHOR_NAME_USER_LINK).exists()).toBe(true);
	});

	it('display comment text', () => {
		const comment = wrapper.props().comment;

		expect(wrapper.ref(COMMENT_TEXT_ELEMENT).text()).toMatch(comment.text);
	});
});

describe('Comment, current user IS me', () => {
	let wrapper;

	beforeEach(() => {
		wrapper = factory(true);
	});

	it('pop menu is NOT displayed', () => {
		expect(wrapper.findAll(PopMenu).length).toBe(0);
	});
});

describe('Comment, current user IS NOT me', () => {
	let wrapper;

	beforeEach(() => {
		wrapper = factory(false);
	});

	it('report link in burger is displayed', () => {
		expect(wrapper.findAll(PopMenu).length).toBe(1);
	});
});