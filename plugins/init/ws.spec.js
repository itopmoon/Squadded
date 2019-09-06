import Vue from 'vue';
import ws, * as wsPlugin from './ws';

describe('WS Plugin', () => {
	const { WS_LINK } = process.env;
	const STORE = {
		subscribe: function () {},
		state: {
			merchant: {
				id: null,
			},
		},
	};

	describe('WSToken class', () => {
		const { WSToken } = wsPlugin;
		beforeEach(() => {
			localStorage.clear();
		});

		it('should remove error, userId, _jwt, guid and ts from sending object', () => {
			const mockJWT = 'some.user.jwt';
			const _ws = {
				sendObj: function () {},
			};
			const $ws = new WSToken(_ws);
			localStorage.setItem('userToken', mockJWT);

			spyOn(_ws, 'sendObj');

			expect($ws.sendObj).toEqual(jasmine.any(Function));
			$ws.sendObj({
				item: {},
				guid: 'someGuid',
				error: 'someError',
				userId: 'someUserId',
				ts: 1234567890123,
			});

			expect(_ws.sendObj).toHaveBeenCalledTimes(1);
			const payload = _ws.sendObj.calls.argsFor(0)[0];
			expect(payload).not.toHaveProperty('guid');
			expect(payload).not.toHaveProperty('error');
			expect(payload).not.toHaveProperty('ts');
			expect(payload).not.toHaveProperty('userId');
			expect(payload).not.toHaveProperty('_jwt');
			expect(payload).toHaveProperty('item');
		});

		it('should not send WS message if no user token', () => {
			localStorage.removeItem('userToken');
			const _ws = {
				sendObj: function () {},
			};
			const $ws = new WSToken(_ws);

			spyOn(_ws, 'sendObj');

			$ws.sendObj({
				item: {},
			});

			expect(_ws.sendObj).toHaveBeenCalledTimes(0);
		});
	});

	describe('initSocket function', () => {
		const { initSocket } = wsPlugin;
		const link = 'ws://remote.mock.com/';
		let store;

		beforeEach(() => {
			localStorage.clear();
			store = Object.assign({}, STORE);
			spyOn(Vue, 'use');
		});

		it('should init socket witch exact connection link', () => {
			initSocket(link, store);

			expect(Vue.use).toHaveBeenCalledTimes(1);
			expect(Vue.use.calls.argsFor(0)[1]).toBe(link);
			expect(Vue.use.calls.argsFor(0)[2].connectManually).toBe(true);
		});

		it('should not add user token from localStorage as search query param for WS connection', () => {
			const mockToken = 'head.payload.sign';
			localStorage.setItem('userToken', mockToken);

			initSocket(link, store);

			expect(Vue.use).toHaveBeenCalledTimes(1);
			expect(Vue.use.calls.argsFor(0)[1].includes(`userToken=${mockToken}`)).toBe(false);
			expect(Vue.use.calls.argsFor(0)[2].connectManually).toBe(true);
		});

		it('should not auto-connect WS if no user token', () => {
			initSocket(link, store);

			expect(Vue.use).toHaveBeenCalledTimes(1);
			expect(Vue.use.calls.argsFor(0)[2].connectManually).toBe(true);
		});
	});

	describe('default', () => {
		let ctx;
		beforeEach(() => {
			localStorage.clear();
			ctx = {
				store: Object.assign({}, STORE),
				redirect: function () {},
			};
		});

		it('should invoke proper init sequence', () => {
			spyOn(wsPlugin, 'initSocket');
			spyOn(wsPlugin, 'mutationListener').and.callThrough();
			spyOn(ctx.store, 'subscribe');

			ws(ctx);

			expect(wsPlugin.initSocket).toHaveBeenCalledTimes(1);
			expect(wsPlugin.initSocket.calls.argsFor(0)).toEqual([ WS_LINK, ctx.store ]);

			expect(wsPlugin.mutationListener).toHaveBeenCalledTimes(1);
			expect(wsPlugin.mutationListener.calls.argsFor(0)).toEqual([ ctx.store, ctx.redirect ]);

			expect(ctx.store.subscribe).toHaveBeenCalledTimes(1);
			const func = ctx.store.subscribe.calls.argsFor(0)[0];
			expect(func.name).toBe('mutationDispatcher');
		});
	});
});
