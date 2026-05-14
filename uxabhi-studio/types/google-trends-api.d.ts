declare module 'google-trends-api' {
  interface InterestOverTimeOptions {
    keyword: string | string[]
    startTime?: Date
    endTime?: Date
    geo?: string
    hl?: string
  }

  interface RelatedQueriesOptions {
    keyword: string
    startTime?: Date
    endTime?: Date
    geo?: string
  }

  function interestOverTime(options: InterestOverTimeOptions): Promise<string>
  function relatedQueries(options: RelatedQueriesOptions): Promise<string>

  export { interestOverTime, relatedQueries }
}
