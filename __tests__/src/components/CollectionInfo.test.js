import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollectionInfo } from '../../../src/components/CollectionInfo';

/** */
function createWrapper(props) {
  return render(
    <CollectionInfo
      id="test"
      collectionPath={[1, 2]}
      showCollectionDialog={() => {}}
      {...props}
    />,
  );
}

describe('CollectionInfo', () => {
  it('renders a collapsible section', async () => {
    const user = userEvent.setup();
    createWrapper();

    expect(screen.getByRole('heading', { name: 'collection' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'showCollection' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'collapseSection' }));

    expect(screen.queryByRole('button', { name: 'showCollection' })).not.toBeInTheDocument();
  });
  it('without a collectionPath, renders nothing', () => {
    const wrapper = createWrapper({ collectionPath: [] });
    expect(wrapper.container).toBeEmptyDOMElement();
  });
  it('clicking the button fires showCollectionDialog', async () => {
    const user = userEvent.setup();
    const showCollectionDialog = jest.fn();

    createWrapper({ showCollectionDialog });

    await user.click(screen.getByRole('button', { name: 'showCollection' }));
    expect(showCollectionDialog).toHaveBeenCalled();
  });
});
