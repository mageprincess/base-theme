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

import { fetchMutation, fetchQuery } from 'Util/Request';
import {
    addItemToWishlist,
    removeItemFromWishlist,
    updateAllProductsInWishlist,
    updateLoadStatus,
    productToBeRemovedAfterAdd
} from 'Store/Wishlist';
import { showNotification } from 'Store/Notification';
import { isSignedIn } from 'Util/Auth';
import { Wishlist } from 'Query';

/**
 * Product Wishlist Dispatcher
 * @class WishlistDispatcher
 */
class WishlistDispatcher {
    updateInitialWishlistData(dispatch) {
        if (isSignedIn()) {
            dispatch(updateLoadStatus(true));
            this._syncWishlistWithBE(dispatch);
        } else {
            dispatch(updateAllProductsInWishlist({}));
        }
    }

    _syncWishlistWithBE(dispatch) {
        // Need to get current wishlist from BE, update wishlist
        fetchQuery(Wishlist.getWishlistQuery()).then(({ wishlist }) => {
            if (wishlist.items_count) {
                const productsToAdd = wishlist.items.reduce((prev, wishlistItem) => {
                    const { product } = wishlistItem;
                    const item_id = wishlistItem.id;
                    const { id } = product;

                    return {
                        ...prev,
                        [id]: {
                            ...product,
                            item_id
                        }
                    };
                }, {});

                dispatch(updateAllProductsInWishlist(productsToAdd));
                dispatch(updateLoadStatus(false));
            }
        });
    }

    addItemToWishlist(dispatch, options) {
        const { product } = options;
        const { sku } = product;
        const productToAdd = { sku };

        dispatch(updateLoadStatus(true));

        return fetchMutation(Wishlist.getAddProductToWishlistMutation(
            productToAdd
        )).then(
            () => dispatch(addItemToWishlist({ ...product }))
                && dispatch(showNotification('success', 'Product has been added to your Wish List!')),
            error => dispatch(showNotification('error', 'Error updating wish list!')) && console.log(error)
        );
    }

    removeItemFromWishlist(dispatch, { product, noMessages }) {
        if (noMessages) {
            return fetchMutation(Wishlist.getRemoveProductFromWishlistMutation(product)).then(
                ({ removeProductFromWishlist }) => removeProductFromWishlist
                    && dispatch(removeItemFromWishlist(product))
                    && dispatch(productToBeRemovedAfterAdd(''))
            );
        }

        return fetchMutation(Wishlist.getRemoveProductFromWishlistMutation(product)).then(
            ({ removeProductFromWishlist }) => removeProductFromWishlist && dispatch(removeItemFromWishlist(product))
            && dispatch(showNotification('success', 'Product has been removed from your Wish List!')),
            error => dispatch(showNotification('error', 'Error updating wish list!')) && console.log(error)
        );
    }

    updateProductToBeRemovedAfterAdd(dispatch, options) {
        const { product: { sku } } = options;
        if (sku) return dispatch(productToBeRemovedAfterAdd(sku));

        return dispatch(productToBeRemovedAfterAdd(''));
    }
}

export default new WishlistDispatcher();
