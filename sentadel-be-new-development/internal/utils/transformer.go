package utils

import (
	"fmt"
	"math"
)

func NumToSerial(num int) string {
	leadNum := math.Floor(float64((num - 1) / 1000))
	leadChar := string('A' - 1 + (int(leadNum) + 1))
	trail := int(math.Mod(float64(num-1), 1000) + 1)
	serial := leadChar + fmt.Sprintf("%04d", trail)

	return serial
}
