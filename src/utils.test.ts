import { isUUID, genRandomUsername, omit, isCuid, isValidPath } from './utils'

describe('Utils', () => {
  describe('isValidPath', () => {
    it('Correctly validates a correct url path', () => {
      const hostname = 'developer.mozilla.org'
      const path = '/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test'

      expect(isValidPath(hostname, path)).toBe(true)
    })

    it('Correctly rejects a invalid url path', () => {
      const hostname = 'developer.mozilla.org'
      const path = 'hahahhahahaha'

      expect(isValidPath(hostname, path)).toBe(false)
    })
  })

  describe('omit', () => {
    it('Correctly omits keys from object', () => {
      const myObj = {
        name: 'Gio',
        age: 100,
        password: 'data-leak!!!!',
      }

      const newObj = omit(myObj, ['password'])

      expect(newObj).toStrictEqual({ name: 'Gio', age: 100 })
    })
  })

  describe('isCuid', () => {
    it('Correctly validates a real cuid', () => {
      const validCuids = [
        'ckihwfi3e00004mp4b00oa8ko',
        'ckihwg7nw000026lg2u7618u9',
        'cjld2cyuq0000t3rmniod1foy',
      ]

      const result = validCuids.every(isCuid)

      expect(result).toBe(true)
    })
  })

  describe('isUUID', () => {
    it('Correctly identifies v4 uuid as a valid uuid', () => {
      const result = isUUID('2f85d9fc-6073-42d0-a0f3-53cf989542d7')

      expect(result).toBe(true)
    })

    it('Correctly rejects a non v4 uuid value', () => {
      const result = isUUID('2f85d-6073-42d0-a0f3')
      expect(result).toBe(false)
    })
  })

  describe('genRandomUsername', () => {
    it('Always generates three, four or five-word random usernames', () => {
      for (let i = 0; i < 10000; i++) {
        const name = genRandomUsername()
        const wordCount = name.split('-').length

        const hasValidWordCount = [3, 4, 5].includes(wordCount)

        expect(hasValidWordCount).toBe(true)
      }
    })
  })
})
