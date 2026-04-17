declare module 'pretty-print-json' {
    export const prettyPrintJson: {
        toHtml(
            value: any,
            options?: {
                indent?: number
                lineNumbers?: boolean
                quoteKeys?: boolean
            }
        ): string
    }
}
