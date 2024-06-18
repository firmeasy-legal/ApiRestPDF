export type FileObject = {
	success: true,
	path: string,
	message?: undefined
} | {
	success: false,
	path?: undefined,
	message: string
}