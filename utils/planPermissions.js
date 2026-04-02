export const PLANS = {
  free: {
    interestLimit: 2,
    canViewVerified: false,
    canViewContact: false,
    canViewWhoViewed: false,
    advancedFilters: false,
    priorityListing: false,
  },
  premium: {
    interestLimit: Infinity,
    canViewVerified: true,
    canViewContact: false,
    canViewWhoViewed: true,
    advancedFilters: true,
    priorityListing: false,
  },
  elite: {
    interestLimit: Infinity,
    canViewVerified: true,
    canViewContact: true,
    canViewWhoViewed: true,
    advancedFilters: true,
    priorityListing: true,
  },
};

export const getPlan = (user) => PLANS[user?.membershipPlan] || PLANS.free;
