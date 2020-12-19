import axios from 'axios'
import { ResultAsync } from 'neverthrow'
import { discordWebhookUrl } from 'env'

export const sendErrorReport = (description: string, gitRef: string, userAgent: string): ResultAsync<null, null> =>
  ResultAsync.fromPromise(
    axios.post(discordWebhookUrl, {
      embeds: [{
        title: 'Embed Error',
        description,
        fields: [
          {
            name: 'Git Ref',
            value: gitRef,
          },
          {
            name: 'User Agent',
            value: userAgent,
          }
        ]
      }]
    }).then(() => null),
    () => null
  )

