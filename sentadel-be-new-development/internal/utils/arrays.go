package utils

import (
	"fmt"
	"strconv"
	"strings"
)

func ArrayToString(a []int64, delim string) string {
	return strings.Trim(strings.Replace(fmt.Sprint(a), " ", delim, -1), "[]")
}

func Contains(slice []string, item string) bool {
	set := make(map[string]struct{}, len(slice))
	for _, s := range slice {
		set[s] = struct{}{}
	}

	_, ok := set[item]
	return ok
}

func ConvertStringToArrayNumber(value string, delim string) []int {
	str := strings.Split(value, delim)

	var slice []int // empty slice
	for _, digit := range str {
		number, _ := strconv.Atoi(digit)
		slice = append(slice, number)
	}

	return slice
}
