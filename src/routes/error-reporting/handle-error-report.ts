import { route, AppData } from 'router'
import { decode } from 'routes/parser'
import * as rt from 'runtypes'
import { sendErrorReport } from 'services/discord'
import { other } from 'errors'

const errorReportingDecoder = rt.Record({
  ref: rt.String,
  errorMessage: rt.String,
  'user-agent': rt.String,
})


export const handler = route((req) => {
  const rawData = {
    ...req.body,
    ...req.headers,
  }

  return decode(errorReportingDecoder, rawData).map((data) =>
    sendErrorReport(data.errorMessage, data.ref, data['user-agent'])
      .map(AppData.init)
      .mapErr(() => other('Unable to make error report'))
  )
})

