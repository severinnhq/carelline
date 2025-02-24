// scrollUtils.ts
export const getScrollOffset = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return 0;
      case 'feature-section':
        return 128;
      default:
        return 96;
    }
  };