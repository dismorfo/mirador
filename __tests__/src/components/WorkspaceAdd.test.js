import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { renderWithProviders } from '../../utils/store';
import { WorkspaceAdd } from '../../../src/components/WorkspaceAdd';
import manifestFixture001 from '../../fixtures/version-2/001.json';
import manifestFixture002 from '../../fixtures/version-2/002.json';

/** create wrapper */
function createWrapper(props) {
  return renderWithProviders(
    <DndProvider backend={HTML5Backend}>
      <WorkspaceAdd
        setWorkspaceAddVisibility={() => {}}
        catalog={[
          { manifestId: 'bar' },
          { manifestId: 'foo' },
        ]}
        classes={{}}
        t={str => str}
        {...props}
      />
    </DndProvider>,
    { preloadedState: { manifests: { bar: { id: 'bar', isFetching: false, json: manifestFixture001 }, foo: { id: 'foo', isFetching: false, json: manifestFixture002 } } } },
  );
}

describe('WorkspaceAdd', () => {
  it('renders a list item for each manifest in the state', () => {
    createWrapper();

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('focuses on the first manifest item', () => {
    createWrapper();

    expect(screen.getByRole('button', { name: 'Bodleian Library Human Freaks 2 (33)' })).toHaveFocus();
  });

  it('without manifests, renders an empty message', () => {
    createWrapper({ catalog: [] });

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.getByText('emptyResourceList')).toBeInTheDocument();
  });

  it('toggles the workspace visibility', async () => {
    const user = userEvent.setup();
    const setWorkspaceAddVisibility = jest.fn();
    createWrapper({ setWorkspaceAddVisibility });

    await user.click(screen.getByRole('button', { name: 'Bodleian Library Human Freaks 2 (33)' }));

    expect(setWorkspaceAddVisibility).toHaveBeenCalledWith(false);
  });

  it('has a button to add new resources', async () => {
    const user = userEvent.setup();
    createWrapper();

    const fab = screen.getByRole('button', { name: 'addResource' });

    expect(fab).toBeInTheDocument();
    await user.click(fab);

    expect(fab).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'closeAddResourceForm' }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('hides the form on submit', async () => {
    const user = userEvent.setup();
    createWrapper();

    await user.click(screen.getByRole('button', { name: 'addResource' }));

    await user.type(screen.getByRole('textbox'), 'abc');
    await user.click(screen.getByRole('button', { name: 'fetchManifest' }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('scrolls to the top after an item is added', async () => {
    const user = userEvent.setup();
    const { container } = createWrapper();

    const scrollTo = jest.fn();

    jest.spyOn(container.querySelector('.mirador-workspace-add'), 'scrollTo').mockImplementation(scrollTo); // eslint-disable-line testing-library/no-node-access, testing-library/no-container

    await user.click(screen.getByRole('button', { name: 'addResource' }));

    await user.type(screen.getByRole('textbox'), 'abc');
    await user.click(screen.getByRole('button', { name: 'fetchManifest' }));

    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', left: 0, top: 0 });
  });

  it('hides the form on cancel action', async () => {
    const user = userEvent.setup();
    createWrapper();

    await user.click(screen.getByRole('button', { name: 'addResource' }));

    await user.type(screen.getByRole('textbox'), 'abc');
    await user.click(screen.getByRole('button', { name: 'cancel' }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  describe('drag and drop', () => {
    it('adds a new catalog entry from a manifest', async () => {
      const manifestJson = '{ "data": "123" }';

      const addResource = jest.fn();

      createWrapper({ addResource });
      const dropTarget = screen.getByRole('list');

      const file = new File([manifestJson], 'manifest.json', { type: 'application/json' });
      const dataTransfer = {
        files: [file],
        types: ['Files'],
      };

      fireEvent.dragStart(dropTarget, { dataTransfer });
      fireEvent.dragEnter(dropTarget, { dataTransfer });
      fireEvent.dragOver(dropTarget, { dataTransfer });
      fireEvent.drop(dropTarget, { dataTransfer });

      await waitFor(() => expect(addResource).toHaveBeenCalledWith(expect.stringMatching(/^[0-9a-f-]+$/), manifestJson, { provider: 'file' }));
    });

    it('adds a new catalog entry from a IIIF drag and drop icon', () => {
      const manifestId = 'manifest.json';

      const addResource = jest.fn();

      createWrapper({ addResource });
      const dropTarget = screen.getByRole('list');

      const dataTransfer = {
        getData: () => 'https://iiif.io/?manifest=manifest.json',
        types: ['Url'],
      };

      fireEvent.dragStart(dropTarget, { dataTransfer });
      fireEvent.dragEnter(dropTarget, { dataTransfer });
      fireEvent.dragOver(dropTarget, { dataTransfer });
      fireEvent.drop(dropTarget, { dataTransfer });

      expect(addResource).toHaveBeenCalledWith(manifestId);
    });
  });
});
