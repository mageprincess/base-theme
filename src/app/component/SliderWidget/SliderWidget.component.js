/* eslint-disable react/no-array-index-key */
/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import Slider from 'Component/Slider';
import Image from 'Component/Image';
import Html from 'Component/Html';
import isMobile from 'Util/Mobile';
import './SliderWidget.style';

export const TABLET_WIDTH = 768;
export const DESKTOP_WIDTH = 1201;

/**
 * Homepage slider
 * @class SliderWidget
 */
export default class SliderWidget extends PureComponent {
    static propTypes = {
        slider: PropTypes.shape({
            title: PropTypes.string,
            slides_to_display: PropTypes.number,
            slides_to_display_mobile: PropTypes.number,
            slides_to_display_tablet: PropTypes.number,
            slides: PropTypes.arrayOf(
                PropTypes.shape({
                    desktop_image: PropTypes.string,
                    mobile_image: PropTypes.string,
                    slide_text: PropTypes.string,
                    isPlaceholder: PropTypes.bool
                })
            )
        })
    };

    static defaultProps = {
        slider: [{}]
    };

    state = { activeImage: 0, slideWidth: 100 };

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentDidUpdate(prevProps) {
        const {
            slider: {
                slides_to_display,
                slides_to_display_tablet
            }
        } = this.props;
        const {
            slider: {
                slides_to_display: prev_slides_to_display,
                slides_to_display_tablet: prev_slides_to_display_tablet
            }
        } = prevProps;

        if (prev_slides_to_display !== slides_to_display
            && prev_slides_to_display_tablet !== slides_to_display_tablet) {
            this.updateWindowDimensions();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
        const {
            slider: {
                slides_to_display,
                slides_to_display_tablet,
                slides_to_display_mobile
            }
        } = this.props;

        const HUNDRED_PERCENT = 100;

        if (window.innerWidth >= DESKTOP_WIDTH) {
            const slidesQtyPerPage = slides_to_display || 1;
            this.setState({ slideWidth: HUNDRED_PERCENT / slidesQtyPerPage });
        } else if (window.innerWidth >= TABLET_WIDTH) {
            const slidesQtyPerPage = slides_to_display_tablet || 1;
            this.setState({ slideWidth: HUNDRED_PERCENT / slidesQtyPerPage });
        } else {
            const slidesQtyPerPage = slides_to_display_mobile || 1;
            this.setState({ slideWidth: HUNDRED_PERCENT / slidesQtyPerPage });
        }
    };


    onActiveImageChange = (activeImage) => {
        this.setState({ activeImage });
    };

    getSlideImage(slide) {
        const {
            desktop_image,
            mobile_image
        } = slide;

        if (isMobile.any() && mobile_image) {
            return `/${mobile_image}`;
        }

        if (!desktop_image) {
            return '';
        }

        return `/${desktop_image}`;
    }

    renderSlide = (slide, i) => {
        const {
            slide_text,
            isPlaceholder,
            title: block
        } = slide;

        const {
            slideWidth
        } = this.state;

        return (
            <figure
              block="SliderWidget"
              elem="Figure"
              key={ i }
              style={ { width: `${ slideWidth }%` } }
            >
                <Image
                  mix={ { block: 'SliderWidget', elem: 'FigureImage' } }
                  ratio="custom"
                  src={ this.getSlideImage(slide) }
                  isPlaceholder={ isPlaceholder }
                />
                <figcaption
                  block="SliderWidget"
                  elem="Figcaption"
                  mix={ { block } }
                >
                    <Html content={ slide_text || '' } />
                </figcaption>
            </figure>
        );
    };

    render() {
        const { activeImage } = this.state;

        const {
            slider: {
                slides,
                title: block,
                slides_to_display,
                slides_to_display_tablet,
                slides_to_display_mobile
            }
        } = this.props;

        if (
            slides_to_display === undefined
            || slides_to_display_tablet === undefined
            || slides_to_display_mobile === undefined
        ) {
            return null;
        }

        return (
            <Slider
              mix={ { block: 'SliderWidget', mix: { block } } }
              showCrumbs
              activeImage={ activeImage }
              onActiveImageChange={ this.onActiveImageChange }
              slidesOnDesktop={ slides_to_display }
              slidesOnTablet={ slides_to_display_tablet }
              slidesOnMobile={ slides_to_display_mobile }
            >
                { slides.map(this.renderSlide) }
            </Slider>
        );
    }
}
