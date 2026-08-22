'use client'

import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  linkWithPopup,
  OAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
} from 'firebase/auth'

export class FirebaseClientConfigurationError extends Error {
  constructor(public readonly issue: 'missing-value' | 'invalid-project-id' | 'invalid-app-id') {
    super('Firebase client is not configured correctly')
    this.name = 'FirebaseClientConfigurationError'
  }
}

function getFirebaseClientAuth(): Auth {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    throw new FirebaseClientConfigurationError('missing-value')
  }
  if (config.projectId.startsWith('1:') || !/^[a-z][a-z0-9-]{4,29}$/.test(config.projectId)) {
    throw new FirebaseClientConfigurationError('invalid-project-id')
  }
  if (!/^1:\d+:web:[a-z0-9]+$/i.test(config.appId)) {
    throw new FirebaseClientConfigurationError('invalid-app-id')
  }

  const app = getApps().length ? getApp() : initializeApp(config)
  return getAuth(app)
}

export async function getGoogleFirebaseIdToken(options: { linkToCurrentUser?: boolean } = {}) {
  const auth = getFirebaseClientAuth()
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  if (options.linkToCurrentUser && auth.currentUser) {
    const alreadyLinked = auth.currentUser.providerData.some(({ providerId }) => providerId === 'google.com')
    if (alreadyLinked) return auth.currentUser.getIdToken(true)
    const credential = await linkWithPopup(auth.currentUser, provider)
    return credential.user.getIdToken(true)
  }

  const credential = await signInWithPopup(auth, provider)
  return credential.user.getIdToken(true)
}

export async function getFacebookFirebaseIdToken(options: { linkToCurrentUser?: boolean } = {}) {
  const auth = getFirebaseClientAuth()
  const provider = new FacebookAuthProvider()
  provider.addScope('email')

  if (options.linkToCurrentUser && auth.currentUser) {
    const alreadyLinked = auth.currentUser.providerData.some(({ providerId }) => providerId === 'facebook.com')
    if (alreadyLinked) return auth.currentUser.getIdToken(true)
    const credential = await linkWithPopup(auth.currentUser, provider)
    return credential.user.getIdToken(true)
  }

  const credential = await signInWithPopup(auth, provider)
  return credential.user.getIdToken(true)
}

export async function getAppleFirebaseIdToken(options: { linkToCurrentUser?: boolean } = {}) {
  const auth = getFirebaseClientAuth()
  const provider = new OAuthProvider('apple.com')
  provider.addScope('email')
  provider.addScope('name')

  if (options.linkToCurrentUser && auth.currentUser) {
    const alreadyLinked = auth.currentUser.providerData.some(({ providerId }) => providerId === 'apple.com')
    if (alreadyLinked) return auth.currentUser.getIdToken(true)
    const credential = await linkWithPopup(auth.currentUser, provider)
    return credential.user.getIdToken(true)
  }

  const credential = await signInWithPopup(auth, provider)
  return credential.user.getIdToken(true)
}

export async function signOutFirebaseClient() {
  try {
    await signOut(getFirebaseClientAuth())
  } catch (error) {
    if (!(error instanceof FirebaseClientConfigurationError)) throw error
  }
}
