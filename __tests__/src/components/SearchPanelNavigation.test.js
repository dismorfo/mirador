import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchPanelNavigation } from '../../../src/components/SearchPanelNavigation';

/**
 * Helper function to create a shallow wrapper around SearchPanelNavigation
 */
function createWrapper(props) {
  return render(
    <SearchPanelNavigation
      companionWindowId="cw"
      direction="ltr"
      windowId="window"
      {...props}
    />,
  );
}

describe('SearchPanelNavigation', () => {
  describe('when searchHits are available', () => {
    it('renders text with buttons', async () => {
      const selectAnnotation = jest.fn();
      const user = userEvent.setup();
      createWrapper({
        searchHits: [{ annotations: ['1'] }, { annotations: ['2'] }, { annotations: ['3'] }],
        selectAnnotation,
        selectedContentSearchAnnotation: ['2'],
      });
      expect(screen.getByText('pagination')).toBeInTheDocument();
      expect(screen.getAllByRole('button').length).toEqual(2);
      await user.click(screen.getByRole('button', { name: 'searchPreviousResult' }));
      expect(selectAnnotation).toHaveBeenCalledWith('1');
      await user.click(screen.getByRole('button', { name: 'searchNextResult' }));
      expect(selectAnnotation).toHaveBeenCalledWith('3');
    });
    it('buttons disabled when no next/prev', () => {
      createWrapper({
        searchHits: [{ annotations: ['1'] }],
        selectedContentSearchAnnotation: ['1'],
      });
      expect(screen.getByRole('button', { name: 'searchPreviousResult' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'searchNextResult' })).toBeDisabled();
    });
  });
});
