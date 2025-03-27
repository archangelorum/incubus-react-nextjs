import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { 
  Shield, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { ModerationTabs } from '@/components/admin/moderation/moderation-tabs';
import { ModerationFilters } from '@/components/admin/moderation/moderation-filters';

// Default page size
const PAGE_SIZE = 10;

interface ModerationPageProps {
  searchParams?: {
    tab?: string;
    page?: string;
    status?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

async function getPendingReviews(searchParams: ModerationPageProps['searchParams'] = {}) {
  const page = Number(searchParams.page) || 1;
  const skip = (page - 1) * PAGE_SIZE;
  const status = searchParams.status || 'PENDING';
  const sortBy = searchParams.sortBy || 'createdAt';
  const sortOrder = searchParams.sortOrder || 'desc';

  // Build where clause
  const where: any = {};
  
  if (status) {
    where.status = status;
  }

  // Build orderBy
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // Get reviews with pagination
  const reviews = await prisma.gameReview.findMany({
    where,
    orderBy,
    skip,
    take: PAGE_SIZE,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      game: {
        select: {
          id: true,
          title: true,
          slug: true
        }
      }
    }
  });

  // Get total count for pagination
  const totalReviews = await prisma.gameReview.count({ where });
  const totalPages = Math.ceil(totalReviews / PAGE_SIZE);

  return {
    reviews,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      totalReviews,
      totalPages
    }
  };
}

async function getReportedContent(searchParams: ModerationPageProps['searchParams'] = {}) {
  const page = Number(searchParams.page) || 1;
  const skip = (page - 1) * PAGE_SIZE;
  const status = searchParams.status || 'OPEN';
  const type = searchParams.type || '';
  const sortBy = searchParams.sortBy || 'createdAt';
  const sortOrder = searchParams.sortOrder || 'desc';

  // Build where clause
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (type) {
    where.type = type;
  }

  // Build orderBy
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // Get dispute cases with pagination
  const reports = await prisma.disputeCase.findMany({
    where,
    orderBy,
    skip,
    take: PAGE_SIZE,
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      defender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      resolvedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  });

  // Get total count for pagination
  const totalReports = await prisma.disputeCase.count({ where });
  const totalPages = Math.ceil(totalReports / PAGE_SIZE);

  // Get dispute type counts for filters
  const typeCounts = await prisma.$queryRaw`
    SELECT "type", COUNT(*) as "count" 
    FROM "dispute_case" 
    WHERE "status" = ${status}
    GROUP BY "type"
  `;

  return {
    reports,
    typeCounts,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      totalReports,
      totalPages
    }
  };
}

export default async function ModerationPage({ searchParams }: ModerationPageProps) {
  const t = await getTranslations('admin');
  
  // Determine which tab is active
  const activeTab = searchParams?.tab || 'reviews';
  
  // Fetch data based on active tab
  let reviewsData = null;
  let reportsData = null;
  
  if (activeTab === 'reviews') {
    reviewsData = await getPendingReviews(searchParams);
  } else if (activeTab === 'reports') {
    reportsData = await getReportedContent(searchParams);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('moderation.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('moderation.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/moderation?tab=${activeTab}&refresh=${Date.now()}`}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('moderation.actions.refresh')}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Suspense fallback={<div>Loading tabs...</div>}>
        <ModerationTabs activeTab={activeTab} />
      </Suspense>

      {/* Content based on active tab */}
      {activeTab === 'reviews' && reviewsData && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <Suspense fallback={<div>Loading filters...</div>}>
              <ModerationFilters 
                type="reviews"
                currentStatus={searchParams?.status || 'PENDING'}
              />
            </Suspense>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">
                {t('moderation.reviews.title')} 
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({reviewsData.pagination.totalReviews} {t('moderation.reviews.count')})
                </span>
              </h2>
            </div>

            {reviewsData.reviews.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {reviewsData.reviews.map((review) => (
                  <div key={review.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                          {review.user.image ? (
                            <img
                              src={review.user.image}
                              alt={review.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <MessageSquare className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{review.user.name}</h3>
                            <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                            <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm font-medium mt-1">{review.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{review.content}</p>
                          <div className="mt-2">
                            <Link
                              href={`/games/${review.game.slug}`}
                              className="text-xs text-primary hover:underline"
                            >
                              {review.game.title}
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/moderation/reviews/${review.id}`}
                          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </Link>
                        <button
                          className="p-2 rounded-md hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                          aria-label={t('moderation.actions.approve')}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                          aria-label={t('moderation.actions.reject')}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium">{t('moderation.reviews.noReviews')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('moderation.reviews.allClear')}
                </p>
              </div>
            )}

            {/* Pagination for reviews */}
            {reviewsData.pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('moderation.pagination.showing', { 
                    from: (reviewsData.pagination.page - 1) * reviewsData.pagination.pageSize + 1,
                    to: Math.min(reviewsData.pagination.page * reviewsData.pagination.pageSize, reviewsData.pagination.totalReviews),
                    total: reviewsData.pagination.totalReviews
                  })}
                </div>
                <div className="flex space-x-2">
                  {Array.from({ length: reviewsData.pagination.totalPages }).map((_, i) => (
                    <Link
                      key={i}
                      href={{
                        query: {
                          ...searchParams,
                          tab: 'reviews',
                          page: i + 1
                        }
                      }}
                      className={`px-3 py-1 rounded-md ${
                        reviewsData.pagination.page === i + 1
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {i + 1}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && reportsData && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <Suspense fallback={<div>Loading filters...</div>}>
              <ModerationFilters 
                type="reports"
                currentStatus={searchParams?.status || 'OPEN'}
                currentType={searchParams?.type || ''}
                typeCounts={reportsData.typeCounts as any}
              />
            </Suspense>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">
                {t('moderation.reports.title')} 
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({reportsData.pagination.totalReports} {t('moderation.reports.count')})
                </span>
              </h2>
            </div>

            {reportsData.reports.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {reportsData.reports.map((report) => (
                  <div key={report.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium">{report.title}</h3>
                          <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                          <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.type === 'CONTENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            report.type === 'TRANSACTION' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                            report.type === 'USER_BEHAVIOR' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {t(`moderation.reports.types.${report.type.toLowerCase()}`, { fallback: report.type })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{report.description}</p>
                        <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <span className="font-medium">{t('moderation.reports.reporter')}:</span>
                            <span className="ml-1">{report.reporter.name}</span>
                          </div>
                          {report.defender && (
                            <>
                              <span className="mx-2">•</span>
                              <div className="flex items-center">
                                <span className="font-medium">{t('moderation.reports.reported')}:</span>
                                <span className="ml-1">{report.defender.name}</span>
                              </div>
                            </>
                          )}
                          {report.relatedEntityType && (
                            <>
                              <span className="mx-2">•</span>
                              <div className="flex items-center">
                                <span className="font-medium">{t('moderation.reports.relatedTo')}:</span>
                                <span className="ml-1">{report.relatedEntityType} #{report.relatedEntityId}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          href={`/admin/moderation/reports/${report.id}`}
                          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium">{t('moderation.reports.noReports')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('moderation.reports.allClear')}
                </p>
              </div>
            )}

            {/* Pagination for reports */}
            {reportsData.pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('moderation.pagination.showing', { 
                    from: (reportsData.pagination.page - 1) * reportsData.pagination.pageSize + 1,
                    to: Math.min(reportsData.pagination.page * reportsData.pagination.pageSize, reportsData.pagination.totalReports),
                    total: reportsData.pagination.totalReports
                  })}
                </div>
                <div className="flex space-x-2">
                  {Array.from({ length: reportsData.pagination.totalPages }).map((_, i) => (
                    <Link
                      key={i}
                      href={{
                        query: {
                          ...searchParams,
                          tab: 'reports',
                          page: i + 1
                        }
                      }}
                      className={`px-3 py-1 rounded-md ${
                        reportsData.pagination.page === i + 1
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {i + 1}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}