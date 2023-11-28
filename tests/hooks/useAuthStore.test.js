import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { authSlice } from "../../src/store/auth/authSlice";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useAuthStore } from "../../src/hooks/useAuthStore";
import { initialState, notAuthenticatedState } from "../fixtures/authStates";
import { testUserCredentials } from "../fixtures/testUser";
import calendarApi from "../../src/apis/calendarApi";

const getMockStore = ( initialState ) => {
    return configureStore({
        reducer: {
            auth: authSlice.reducer
        },
        preloadedState: {
            auth: { ...initialState }
        }
    });
};

describe('Prubeas en el useAuthStore', () => {

    beforeEach(() => localStorage.clear());

    test('debe de regresar los valores por defecto', () => {
        
        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider>
        });

        expect( result.current ).toEqual({
            status:'not-authenticated',
            user: {},
            errorMessage: undefined,
            checkAuthToken: expect.any(Function),
            startLogin: expect.any(Function),
            startLogout: expect.any(Function),
            startRegister: expect.any(Function)
        });

    });

    test('startLogin debe de realizar el login correctamente', async() => {
        
        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider>
        });

        await act(async() => {
            await result.current.startLogin( testUserCredentials );
        });

        const { errorMessage, status, user } = result.current;
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '6555150e950dc7f1f2bc8d99' }
        });

        expect( localStorage.getItem('token') ).toEqual( expect.any(String) );
        expect( localStorage.getItem('token-init-date') ).toEqual( expect.any(String) );

    });

    test('startLogin debe de fallar la autenticación', async() => {

        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider>
        });

        await act(async() => {
            await result.current.startLogin({ email: 'algo@google.com', password: '12345678' });
        });

        const { errorMessage, status, user } = result.current; 
        expect( localStorage.getItem('token') ).toBe(null);
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: 'Credenciales incorrectas',
            status: 'not-authenticated',
            user: {},
        });

        await waitFor(
            () => expect( result.current.errorMessage ).toBe(undefined)
        );

    });

    test('startRegister debe de crear un usuario', async() => {

        const newUser = { email: 'algo@google.com', password: '12345678', name: 'Test User 2' };

        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider>
        });

        const spy = jest.spyOn( calendarApi, 'post' ).mockReturnValue({
            data: {
                ok: true,
                uid: "123456789",
                name: "Test User",
                token: "ALGUN-TOKEN"
            }
        });

        await act(async() => {
            await result.current.startRegister(newUser);
        });

        const { errorMessage, status, user } = result.current;
        
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '123456789' }
        });

        spy.mockRestore(); //Destruye el espia

    });

    test('startRegister debe de fallar la creación', async() => {

        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider>
        });

        await act(async() => {
            await result.current.startRegister(testUserCredentials);
        });

        const { errorMessage, status, user } = result.current;
            
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: "Un usuario existe con ese correo",
            status: "not-authenticated",
            user: {},
        });

    });

    test('checkAuthToken debe de fallar si no hay token', async() => {
        
        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider>
        });

        await act(async() => {
            await result.current.checkAuthToken();
        });

        const { errorMessage, status, user } = result.current;
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'not-authenticated',
            user: {}
        });

    });

    test('checkAuthToken debe de autenticar el usuario si hay un token', async() => {

        const { data } = await calendarApi.post('/auth', testUserCredentials );
        localStorage.setItem('token', data.token);

        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider>
        });

        await act(async() => {
            await result.current.checkAuthToken();
        });

        const { errorMessage, status, user } = result.current;
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '6555150e950dc7f1f2bc8d99' }
        });

    });

});

