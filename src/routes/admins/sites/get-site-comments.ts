import { decode } from 'routes/parser'
import * as rt from 'runtypes'
import validator from 'validator'
import { err, ResultAsync } from 'neverthrow'

import { protectedRoute, AppData } from 'router'
import * as Errors from 'errors'
import { getLatestSiteComments, getSingleSite } from 'db/actions'
import { User, Comment, Site } from 'db/types'

type RouteError = Errors.RouteError

const siteIdDecoder = rt.String.withConstraint(
    (s) => s.startsWith('c') && validator.isAlphanumeric(s)
)

const errorMsg = 'Request path requires a cuid'

const getAdminSiteComments = (
    siteId: Site['id'],
    adminId: User['id']
): ResultAsync<Comment.WithAuthorAndPost[], RouteError> =>
    getSingleSite({ type_: 'Cuid', val: siteId })
        .andThen((site) =>
            site.owner_id === adminId
                ? getLatestSiteComments(siteId)
                : err(Errors.notFound())
        )

export const handler = protectedRoute<Comment.WithAuthorAndPost[]>((req, admin) =>
    decode(siteIdDecoder, req.params.id, errorMsg).map((siteId) =>
        getAdminSiteComments(siteId, admin.id).map(AppData.init)
    )
)
