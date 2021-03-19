type Result = { path: string }

declare const tarInstall: (url: string, root?: string) => Promise<Result>

export = tarInstall
