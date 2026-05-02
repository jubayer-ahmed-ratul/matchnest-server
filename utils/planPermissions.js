export const PLANS = {
  free: {
    interestLimit: 2,
    canViewVerified: false,
    canViewContact: false,
    canViewWhoViewed: false,
    advancedFilters: false,
    priorityListing: false,
    canViewSuggestions: false,
    canChat: false,
  },
  premium: {
    interestLimit: 5,
    canViewVerified: true,
    canViewContact: false,
    canViewWhoViewed: true,
    advancedFilters: true,
    priorityListing: false,
    canViewSuggestions: true,
    canChat: true,
  },
  elite: {
    interestLimit: Infinity,
    canViewVerified: true,
    canViewContact: true,
    canViewWhoViewed: true,
    advancedFilters: true,
    priorityListing: true,
    canViewSuggestions: true,
    canChat: true,
  },
};

export const getPlan = (user) => PLANS[user?.membershipPlan] || PLANS.free;
