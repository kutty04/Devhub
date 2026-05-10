import nacl from 'tweetnacl'
import { secretbox } from 'tweetnacl'
import * as utils from 'tweetnacl-util'

// Generate a key from password
export function deriveKey(password: string): Uint8Array {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  return nacl.hash(data).slice(0, 32) // 32 bytes for secretbox
}

// Encrypt
export function encrypt(message: string, password: string): string {
  const key = deriveKey(password)
  const nonce = nacl.randomBytes(24)
  const messageUint8 = utils.decodeUTF8(message)
  const encrypted = secretbox(messageUint8, nonce, key)
  
  const fullMessage = new Uint8Array(nonce.length + encrypted.length)
  fullMessage.set(nonce)
  fullMessage.set(encrypted, nonce.length)
  
  return utils.encodeBase64(fullMessage)
}

// Decrypt
export function decrypt(encryptedMessage: string, password: string): string {
  const key = deriveKey(password)
  const fullMessage = utils.decodeBase64(encryptedMessage)
  const nonce = fullMessage.slice(0, 24)
  const encrypted = fullMessage.slice(24)
  
  const decrypted = secretbox.open(encrypted, nonce, key)
  if (!decrypted) throw new Error('Decryption failed')
  
  return utils.encodeUTF8(decrypted)
}
