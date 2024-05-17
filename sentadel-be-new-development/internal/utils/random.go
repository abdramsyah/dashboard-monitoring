package utils

import (
	cryptoRand "crypto/rand"
	mathRand "math/rand"
	"time"
)

const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const nums = "1234567890"

const (
	letterIdxBits = 6                    // 6 bits to represent a letter index
	letterIdxMask = 1<<letterIdxBits - 1 // All 1-bits, as many as letterIdxBits
	letterIdxMax  = 63 / letterIdxBits   // # of letter indices fitting in 63 bits
)

func RandStringBytesMaskImpr(n int) string {
	b := make([]byte, n)
	// A rand.Int63() generates 63 random bits, enough for letterIdxMax letters!
	for i, cache, remain := n-1, mathRand.Int63(), letterIdxMax; i >= 0; {
		if remain == 0 {
			cache, remain = mathRand.Int63(), letterIdxMax
		}
		if idx := int(cache & letterIdxMask); idx < len(letterBytes) {
			b[i] = letterBytes[idx]
			i--
		}
		cache >>= letterIdxBits
		remain--
	}

	return string(b)
}

func RandUniqueCode(length int) string {
	ll := len(nums)
	b := make([]byte, length)
	cryptoRand.Read(b)
	for i := 0; i < length; i++ {
		b[i] = nums[int(b[i])%ll]
	}
	return string(b)
}

func init() {
	mathRand.Seed(time.Now().UnixNano())
}
