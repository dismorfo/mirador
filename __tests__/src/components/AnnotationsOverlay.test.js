import { cloneElement } from 'react';
import { render, screen } from '@testing-library/react';
import OpenSeadragon from 'openseadragon';
import { Utils } from 'manifesto.js';
import { AnnotationsOverlay } from '../../../src/components/AnnotationsOverlay';
import OpenSeadragonCanvasOverlay from '../../../src/lib/OpenSeadragonCanvasOverlay';
import AnnotationList from '../../../src/lib/AnnotationList';
import CanvasWorld from '../../../src/lib/CanvasWorld';
import fixture from '../../fixtures/version-2/019.json';

const canvases = Utils.parseManifest(fixture).getSequences()[0].getCanvases();

jest.mock('../../../src/lib/OpenSeadragonCanvasOverlay');

/** */
const createWrapper = (props) => {
  render(<canvas data-testid="viewer" />);
  const viewer = new OpenSeadragon({ element: screen.getByTestId('viewer') });
  const component = (
    <AnnotationsOverlay
      annotations={[]}
      viewer={viewer}
      classes={{}}
      searchAnnotations={[]}
      windowId="base"
      config={{}}
      updateViewport={jest.fn()}
      t={k => k}
      canvasWorld={new CanvasWorld(canvases)}
      {...props}
    />
  );

  return { component, viewer, ...render(component) };
};

describe('AnnotationsOverlay', () => {
  beforeEach(() => {
    OpenSeadragonCanvasOverlay.mockClear();
  });

  describe('annotationsMatch', () => {
    it('is false if the annotations are a different size', () => {
      const currentAnnotations = [{ id: 1, resources: [{ id: 'rid1' }] }];
      const previousAnnotations = [{ id: 1, resources: [{ id: 'rid1' }] }, { id: 2, resources: [{ id: 'rid2' }] }];

      expect(
        AnnotationsOverlay.annotationsMatch(currentAnnotations, previousAnnotations),
      ).toBe(false);
    });

    it('is true if the previous annotation\'s resource IDs all match', () => {
      const currentAnnotations = [{ id: 1, resources: [{ id: 'rid1' }] }];
      const previousAnnotations = [{ id: 1, resources: [{ id: 'rid1' }] }];

      expect(
        AnnotationsOverlay.annotationsMatch(currentAnnotations, previousAnnotations),
      ).toBe(true);
    });

    it('is true if both are empty', () => {
      expect(AnnotationsOverlay.annotationsMatch([], [])).toBe(true);
    });

    it('is false if the previous annotation\'s resource IDs do not match', () => {
      const currentAnnotations = [{ id: 1, resources: [{ id: 'rid1' }] }];
      const previousAnnotations = [{ id: 1, resources: [{ id: 'rid2' }] }];

      expect(
        AnnotationsOverlay.annotationsMatch(currentAnnotations, previousAnnotations),
      ).toBe(false);
    });

    it('returns true if the annotation resources IDs are empty (to prevent unecessary rerender)', () => {
      const currentAnnotations = [{ id: 1, resources: [] }];
      const previousAnnotations = [{ id: 1, resources: [] }];

      expect(
        AnnotationsOverlay.annotationsMatch(currentAnnotations, previousAnnotations),
      ).toBe(true);
    });
  });

  describe('componentDidUpdate', () => {
    it('sets up a OpenSeadragonCanvasOverlay', () => {
      const { component, rerender } = createWrapper();

      rerender(cloneElement(component, { classes: { whatever: 'value' } }));
      expect(OpenSeadragonCanvasOverlay).toHaveBeenCalledTimes(1);
    });

    it('sets up a listener on update-viewport', () => {
      const { component, rerender, viewer } = createWrapper({ viewer: null });
      const mockAddHandler = jest.spyOn(viewer, 'addHandler');

      rerender(cloneElement(component, { viewer }));
      expect(mockAddHandler).toHaveBeenCalledWith('update-viewport', expect.anything());
    });

    it('sets up canvasUpdate to add annotations to the canvas and forces a redraw', () => {
      const clear = jest.fn();
      const resize = jest.fn();
      const canvasUpdate = jest.fn();

      OpenSeadragonCanvasOverlay.mockImplementation(() => ({
        canvasUpdate,
        clear,
        resize,
      }));

      const { component, rerender, viewer } = createWrapper({ viewer: null });

      const forceRedraw = jest.spyOn(viewer, 'forceRedraw');

      rerender(cloneElement(
        component,
        {
          annotations: [
            new AnnotationList(
              { '@id': 'foo', resources: [{ foo: 'bar' }] },
            ),
          ],
          viewer,
        },
      ));

      // OSD ordinarily would fire this event:
      viewer.raiseEvent('update-viewport');

      expect(clear).toHaveBeenCalled();
      expect(resize).toHaveBeenCalled();
      expect(canvasUpdate).toHaveBeenCalled();
      expect(forceRedraw).toHaveBeenCalled();
    });
  });

  describe('annotationsToContext', () => {
    it('converts the annotations to canvas and checks that the canvas is displayed', () => {
      const strokeRect = jest.fn();
      const context2d = {
        restore: () => { },
        save: () => { },
        strokeRect,
      };

      OpenSeadragonCanvasOverlay.mockImplementation(() => ({
        canvasUpdate: (f) => f(),
        clear: jest.fn(),
        context2d,
        resize: jest.fn(),
      }));

      const palette = {
        default: { strokeStyle: 'yellow' },
      };
      const { component, rerender, viewer } = createWrapper({ palette: { annotations: palette }, viewer: null });

      jest.spyOn(viewer.viewport, 'getMaxZoom').mockImplementation(() => (1));
      jest.spyOn(viewer.viewport, 'getZoom').mockImplementation(() => (0.05));

      rerender(cloneElement(component, {
        annotations: [
          new AnnotationList(
            { '@id': 'foo', resources: [{ on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=10,10,100,200' }] },
          ),
        ],
        viewer,
      }));

      // OSD ordinarily would fire this event:
      viewer.raiseEvent('update-viewport');

      const context = context2d;
      expect(context.strokeStyle).toEqual('yellow');
      expect(context.lineWidth).toEqual(20);
      expect(strokeRect).toHaveBeenCalledWith(10, 10, 100, 200);
    });
  });

  describe('onCanvasClick', () => {
    it('triggers a selectAnnotation for the clicked-on annotation', () => {
      const selectAnnotation = jest.fn();

      const { viewer } = createWrapper({
        annotations: [
          new AnnotationList(
            {
              '@id': 'foo',
              resources: [{
                '@id': 'http://example.org/identifier/annotation/anno-line',
                '@type': 'oa:Annotation',
                motivation: 'sc:painting',
                on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=100,100,250,20',
              }],
            },
          ),
        ],
        selectAnnotation,
      });

      viewer.raiseEvent('canvas-click', {
        eventSource: { viewport: viewer.viewport },
        position: new OpenSeadragon.Point(101, 101),
      });

      expect(selectAnnotation).toHaveBeenCalledWith('base', 'http://example.org/identifier/annotation/anno-line');
    });

    it('triggers a deselectAnnotation for an already-selected annotation', () => {
      const deselectAnnotation = jest.fn();

      const { viewer } = createWrapper({
        annotations: [
          new AnnotationList(
            {
              '@id': 'foo',
              resources: [{
                '@id': 'http://example.org/identifier/annotation/anno-line',
                '@type': 'oa:Annotation',
                motivation: 'sc:painting',
                on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=100,100,250,20',
              }],
            },
          ),
        ],
        deselectAnnotation,
        selectedAnnotationId: 'http://example.org/identifier/annotation/anno-line',
      });

      viewer.raiseEvent('canvas-click', {
        eventSource: { viewport: viewer.viewport },
        position: new OpenSeadragon.Point(101, 101),
      });

      expect(deselectAnnotation).toHaveBeenCalledWith('base', 'http://example.org/identifier/annotation/anno-line');
    });

    it('selects the closest annotation', () => {
      const selectAnnotation = jest.fn();

      const { viewer } = createWrapper({
        annotations: [
          new AnnotationList(
            {
              '@id': 'foo',
              resources: [{
                '@id': 'http://example.org/identifier/annotation/anno-line',
                '@type': 'oa:Annotation',
                motivation: 'sc:painting',
                on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=100,100,250,20',
              }, {
                '@id': 'http://example.org/identifier/annotation/larger-box',
                '@type': 'oa:Annotation',
                motivation: 'sc:painting',
                on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=0,0,250,250',
              }, {
                '@id': 'http://example.org/identifier/annotation/on-another-canvas',
                '@type': 'oa:Annotation',
                motivation: 'sc:painting',
                on: 'http://iiif.io/some-other-canvas#xywh=101,101,3,3',
              }],
            },
          ),
        ],
        selectAnnotation,
      });

      viewer.raiseEvent('canvas-click', {
        eventSource: { viewport: viewer.viewport },
        position: new OpenSeadragon.Point(101, 101),
      });

      expect(selectAnnotation).toHaveBeenCalledWith('base', 'http://example.org/identifier/annotation/anno-line');
    });
  });

  describe('onCanvasMouseMove', () => {
    it('triggers the hover event for every annotation at that point', () => {
      jest.useFakeTimers();
      const hoverAnnotation = jest.fn();

      const { viewer } = createWrapper({
        annotations: [
          new AnnotationList(
            {
              '@id': 'foo',
              resources: [{
                '@id': 'foo',
                '@type': 'oa:Annotation',
                motivation: 'sc:painting',
                on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=100,100,250,20',
              }, {
                '@id': 'bar',
                '@type': 'oa:Annotation',
                motivation: 'sc:painting',
                on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=0,0,250,250',
              }, {
                '@id': 'irrelevant-box',
                '@type': 'oa:Annotation',
                motivation: 'sc:painting',
                on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=0,0,50,50',
              }],
            },
          ),
        ],
        hoverAnnotation,
      });

      viewer.raiseEvent('mouse-move', {
        position: new OpenSeadragon.Point(101, 101),
      });

      jest.advanceTimersByTime(20);
      expect(hoverAnnotation).toHaveBeenCalledWith('base', ['foo', 'bar']);

      jest.useRealTimers();
    });
  });
});
