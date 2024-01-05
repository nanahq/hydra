'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">EatLater Docs</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AdminServiceModule.html" data-type="entity-link" >AdminServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AdminServiceModule-a6d732a7ecba72e918800db937f82094acdd54e55bc4b8ce54aef30ed3dd0382209a4bb7174e336f40c672790ae7d669471c2ea80f1651283a60a08a26780ae9"' : 'data-bs-target="#xs-controllers-links-module-AdminServiceModule-a6d732a7ecba72e918800db937f82094acdd54e55bc4b8ce54aef30ed3dd0382209a4bb7174e336f40c672790ae7d669471c2ea80f1651283a60a08a26780ae9"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AdminServiceModule-a6d732a7ecba72e918800db937f82094acdd54e55bc4b8ce54aef30ed3dd0382209a4bb7174e336f40c672790ae7d669471c2ea80f1651283a60a08a26780ae9"' :
                                            'id="xs-controllers-links-module-AdminServiceModule-a6d732a7ecba72e918800db937f82094acdd54e55bc4b8ce54aef30ed3dd0382209a4bb7174e336f40c672790ae7d669471c2ea80f1651283a60a08a26780ae9"' }>
                                            <li class="link">
                                                <a href="controllers/AddressBookLabelServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddressBookLabelServiceController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/AdminServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminServiceController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AdminServiceModule-a6d732a7ecba72e918800db937f82094acdd54e55bc4b8ce54aef30ed3dd0382209a4bb7174e336f40c672790ae7d669471c2ea80f1651283a60a08a26780ae9"' : 'data-bs-target="#xs-injectables-links-module-AdminServiceModule-a6d732a7ecba72e918800db937f82094acdd54e55bc4b8ce54aef30ed3dd0382209a4bb7174e336f40c672790ae7d669471c2ea80f1651283a60a08a26780ae9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AdminServiceModule-a6d732a7ecba72e918800db937f82094acdd54e55bc4b8ce54aef30ed3dd0382209a4bb7174e336f40c672790ae7d669471c2ea80f1651283a60a08a26780ae9"' :
                                        'id="xs-injectables-links-module-AdminServiceModule-a6d732a7ecba72e918800db937f82094acdd54e55bc4b8ce54aef30ed3dd0382209a4bb7174e336f40c672790ae7d669471c2ea80f1651283a60a08a26780ae9"' }>
                                        <li class="link">
                                            <a href="injectables/AddressBookLabelRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddressBookLabelRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AddressBookLabelService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddressBookLabelService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AdminRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AdminServiceService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminServiceService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ListingsModule.html" data-type="entity-link" >ListingsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ListingsModule-0ba4b29303b2a56d451a5506711533aa0bb21fd65c649b1457d139f88a32e53c14f7461fba362b90341c79d400d3f99dd66c88b2a2b1152eab21ab7ca6d98bbb"' : 'data-bs-target="#xs-controllers-links-module-ListingsModule-0ba4b29303b2a56d451a5506711533aa0bb21fd65c649b1457d139f88a32e53c14f7461fba362b90341c79d400d3f99dd66c88b2a2b1152eab21ab7ca6d98bbb"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ListingsModule-0ba4b29303b2a56d451a5506711533aa0bb21fd65c649b1457d139f88a32e53c14f7461fba362b90341c79d400d3f99dd66c88b2a2b1152eab21ab7ca6d98bbb"' :
                                            'id="xs-controllers-links-module-ListingsModule-0ba4b29303b2a56d451a5506711533aa0bb21fd65c649b1457d139f88a32e53c14f7461fba362b90341c79d400d3f99dd66c88b2a2b1152eab21ab7ca6d98bbb"' }>
                                            <li class="link">
                                                <a href="controllers/ListingsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ListingsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ListingsModule-0ba4b29303b2a56d451a5506711533aa0bb21fd65c649b1457d139f88a32e53c14f7461fba362b90341c79d400d3f99dd66c88b2a2b1152eab21ab7ca6d98bbb"' : 'data-bs-target="#xs-injectables-links-module-ListingsModule-0ba4b29303b2a56d451a5506711533aa0bb21fd65c649b1457d139f88a32e53c14f7461fba362b90341c79d400d3f99dd66c88b2a2b1152eab21ab7ca6d98bbb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ListingsModule-0ba4b29303b2a56d451a5506711533aa0bb21fd65c649b1457d139f88a32e53c14f7461fba362b90341c79d400d3f99dd66c88b2a2b1152eab21ab7ca6d98bbb"' :
                                        'id="xs-injectables-links-module-ListingsModule-0ba4b29303b2a56d451a5506711533aa0bb21fd65c649b1457d139f88a32e53c14f7461fba362b90341c79d400d3f99dd66c88b2a2b1152eab21ab7ca6d98bbb"' }>
                                        <li class="link">
                                            <a href="injectables/ListingCategoryRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ListingCategoryRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ListingMenuRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ListingMenuRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ListingOptionGroupRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ListingOptionGroupRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ScheduledListingRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScheduledListingRepository</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/LocationModule.html" data-type="entity-link" >LocationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-LocationModule-fe894342e2331324c4f666c49ddc48f49cb234972aa9396b6478e49f5149843733dfd09f1ea987278180cca67c744656750f41a3721544d34c396fe0f7d65975"' : 'data-bs-target="#xs-controllers-links-module-LocationModule-fe894342e2331324c4f666c49ddc48f49cb234972aa9396b6478e49f5149843733dfd09f1ea987278180cca67c744656750f41a3721544d34c396fe0f7d65975"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-LocationModule-fe894342e2331324c4f666c49ddc48f49cb234972aa9396b6478e49f5149843733dfd09f1ea987278180cca67c744656750f41a3721544d34c396fe0f7d65975"' :
                                            'id="xs-controllers-links-module-LocationModule-fe894342e2331324c4f666c49ddc48f49cb234972aa9396b6478e49f5149843733dfd09f1ea987278180cca67c744656750f41a3721544d34c396fe0f7d65975"' }>
                                            <li class="link">
                                                <a href="controllers/LocationController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocationController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-LocationModule-fe894342e2331324c4f666c49ddc48f49cb234972aa9396b6478e49f5149843733dfd09f1ea987278180cca67c744656750f41a3721544d34c396fe0f7d65975"' : 'data-bs-target="#xs-injectables-links-module-LocationModule-fe894342e2331324c4f666c49ddc48f49cb234972aa9396b6478e49f5149843733dfd09f1ea987278180cca67c744656750f41a3721544d34c396fe0f7d65975"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-LocationModule-fe894342e2331324c4f666c49ddc48f49cb234972aa9396b6478e49f5149843733dfd09f1ea987278180cca67c744656750f41a3721544d34c396fe0f7d65975"' :
                                        'id="xs-injectables-links-module-LocationModule-fe894342e2331324c4f666c49ddc48f49cb234972aa9396b6478e49f5149843733dfd09f1ea987278180cca67c744656750f41a3721544d34c396fe0f7d65975"' }>
                                        <li class="link">
                                            <a href="injectables/LocationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocationService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationServiceModule.html" data-type="entity-link" >NotificationServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-NotificationServiceModule-972769e0d7684ce4026158f80e131befa6f4441ff65ac9208f9d38b3bea9f7d2e2a4dc2f5e29e2cada380f9626ae1537cb10da95eb4e2cbb6cc6883c69cd473b"' : 'data-bs-target="#xs-controllers-links-module-NotificationServiceModule-972769e0d7684ce4026158f80e131befa6f4441ff65ac9208f9d38b3bea9f7d2e2a4dc2f5e29e2cada380f9626ae1537cb10da95eb4e2cbb6cc6883c69cd473b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-NotificationServiceModule-972769e0d7684ce4026158f80e131befa6f4441ff65ac9208f9d38b3bea9f7d2e2a4dc2f5e29e2cada380f9626ae1537cb10da95eb4e2cbb6cc6883c69cd473b"' :
                                            'id="xs-controllers-links-module-NotificationServiceModule-972769e0d7684ce4026158f80e131befa6f4441ff65ac9208f9d38b3bea9f7d2e2a4dc2f5e29e2cada380f9626ae1537cb10da95eb4e2cbb6cc6883c69cd473b"' }>
                                            <li class="link">
                                                <a href="controllers/NotificationServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationServiceController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/SubscriptionController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SubscriptionController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-NotificationServiceModule-972769e0d7684ce4026158f80e131befa6f4441ff65ac9208f9d38b3bea9f7d2e2a4dc2f5e29e2cada380f9626ae1537cb10da95eb4e2cbb6cc6883c69cd473b"' : 'data-bs-target="#xs-injectables-links-module-NotificationServiceModule-972769e0d7684ce4026158f80e131befa6f4441ff65ac9208f9d38b3bea9f7d2e2a4dc2f5e29e2cada380f9626ae1537cb10da95eb4e2cbb6cc6883c69cd473b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NotificationServiceModule-972769e0d7684ce4026158f80e131befa6f4441ff65ac9208f9d38b3bea9f7d2e2a4dc2f5e29e2cada380f9626ae1537cb10da95eb4e2cbb6cc6883c69cd473b"' :
                                        'id="xs-injectables-links-module-NotificationServiceModule-972769e0d7684ce4026158f80e131befa6f4441ff65ac9208f9d38b3bea9f7d2e2a4dc2f5e29e2cada380f9626ae1537cb10da95eb4e2cbb6cc6883c69cd473b"' }>
                                        <li class="link">
                                            <a href="injectables/NotificationServiceService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationServiceService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SubscriptionRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SubscriptionRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SubscriptionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SubscriptionService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TransactionEmails.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TransactionEmails</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OrdersServiceModule.html" data-type="entity-link" >OrdersServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-OrdersServiceModule-327b1a00db3849a410d8b007165af27b68a32f38a16c0493a123fd6e9c94deab395f697211d6dfe557f8416a3820efbcca9ca009add9fdbb30cd2e2cf74e7b44"' : 'data-bs-target="#xs-controllers-links-module-OrdersServiceModule-327b1a00db3849a410d8b007165af27b68a32f38a16c0493a123fd6e9c94deab395f697211d6dfe557f8416a3820efbcca9ca009add9fdbb30cd2e2cf74e7b44"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OrdersServiceModule-327b1a00db3849a410d8b007165af27b68a32f38a16c0493a123fd6e9c94deab395f697211d6dfe557f8416a3820efbcca9ca009add9fdbb30cd2e2cf74e7b44"' :
                                            'id="xs-controllers-links-module-OrdersServiceModule-327b1a00db3849a410d8b007165af27b68a32f38a16c0493a123fd6e9c94deab395f697211d6dfe557f8416a3820efbcca9ca009add9fdbb30cd2e2cf74e7b44"' }>
                                            <li class="link">
                                                <a href="controllers/OrdersServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrdersServiceController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OrdersServiceModule-327b1a00db3849a410d8b007165af27b68a32f38a16c0493a123fd6e9c94deab395f697211d6dfe557f8416a3820efbcca9ca009add9fdbb30cd2e2cf74e7b44"' : 'data-bs-target="#xs-injectables-links-module-OrdersServiceModule-327b1a00db3849a410d8b007165af27b68a32f38a16c0493a123fd6e9c94deab395f697211d6dfe557f8416a3820efbcca9ca009add9fdbb30cd2e2cf74e7b44"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OrdersServiceModule-327b1a00db3849a410d8b007165af27b68a32f38a16c0493a123fd6e9c94deab395f697211d6dfe557f8416a3820efbcca9ca009add9fdbb30cd2e2cf74e7b44"' :
                                        'id="xs-injectables-links-module-OrdersServiceModule-327b1a00db3849a410d8b007165af27b68a32f38a16c0493a123fd6e9c94deab395f697211d6dfe557f8416a3820efbcca9ca009add9fdbb30cd2e2cf74e7b44"' }>
                                        <li class="link">
                                            <a href="injectables/OrderRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderRepository</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PaymentServiceModule.html" data-type="entity-link" >PaymentServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PaymentServiceModule-153f49327e4632fe596bd8b4f44154af247c3db30327565a9e5855651c986c2e6f8a31058ea741b2721b637638a88f8d7c4abce10d2c2141d33ac3cb5a0219a6"' : 'data-bs-target="#xs-controllers-links-module-PaymentServiceModule-153f49327e4632fe596bd8b4f44154af247c3db30327565a9e5855651c986c2e6f8a31058ea741b2721b637638a88f8d7c4abce10d2c2141d33ac3cb5a0219a6"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PaymentServiceModule-153f49327e4632fe596bd8b4f44154af247c3db30327565a9e5855651c986c2e6f8a31058ea741b2721b637638a88f8d7c4abce10d2c2141d33ac3cb5a0219a6"' :
                                            'id="xs-controllers-links-module-PaymentServiceModule-153f49327e4632fe596bd8b4f44154af247c3db30327565a9e5855651c986c2e6f8a31058ea741b2721b637638a88f8d7c4abce10d2c2141d33ac3cb5a0219a6"' }>
                                            <li class="link">
                                                <a href="controllers/PaymentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/VendorPayoutController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VendorPayoutController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PaymentServiceModule-153f49327e4632fe596bd8b4f44154af247c3db30327565a9e5855651c986c2e6f8a31058ea741b2721b637638a88f8d7c4abce10d2c2141d33ac3cb5a0219a6"' : 'data-bs-target="#xs-injectables-links-module-PaymentServiceModule-153f49327e4632fe596bd8b4f44154af247c3db30327565a9e5855651c986c2e6f8a31058ea741b2721b637638a88f8d7c4abce10d2c2141d33ac3cb5a0219a6"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PaymentServiceModule-153f49327e4632fe596bd8b4f44154af247c3db30327565a9e5855651c986c2e6f8a31058ea741b2721b637638a88f8d7c4abce10d2c2141d33ac3cb5a0219a6"' :
                                        'id="xs-injectables-links-module-PaymentServiceModule-153f49327e4632fe596bd8b4f44154af247c3db30327565a9e5855651c986c2e6f8a31058ea741b2721b637638a88f8d7c4abce10d2c2141d33ac3cb5a0219a6"' }>
                                        <li class="link">
                                            <a href="injectables/DriverWalletRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DriverWalletRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DriverWalletService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DriverWalletService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DriverWalletTransactionRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DriverWalletTransactionRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FlutterwaveService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FlutterwaveService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PaymentRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PaystackService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaystackService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/VendorPayoutRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VendorPayoutRepository</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ReviewsServiceModule.html" data-type="entity-link" >ReviewsServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ReviewsServiceModule-5f29aa47d0c872ea9b9948520e1ee2ab5814c295fe90a355db588687b74f015fe5c7a941a236da1a45c88b22f69851de6205229b40e060180781b29055efd91a"' : 'data-bs-target="#xs-controllers-links-module-ReviewsServiceModule-5f29aa47d0c872ea9b9948520e1ee2ab5814c295fe90a355db588687b74f015fe5c7a941a236da1a45c88b22f69851de6205229b40e060180781b29055efd91a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ReviewsServiceModule-5f29aa47d0c872ea9b9948520e1ee2ab5814c295fe90a355db588687b74f015fe5c7a941a236da1a45c88b22f69851de6205229b40e060180781b29055efd91a"' :
                                            'id="xs-controllers-links-module-ReviewsServiceModule-5f29aa47d0c872ea9b9948520e1ee2ab5814c295fe90a355db588687b74f015fe5c7a941a236da1a45c88b22f69851de6205229b40e060180781b29055efd91a"' }>
                                            <li class="link">
                                                <a href="controllers/ReviewsServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReviewsServiceController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ReviewsServiceModule-5f29aa47d0c872ea9b9948520e1ee2ab5814c295fe90a355db588687b74f015fe5c7a941a236da1a45c88b22f69851de6205229b40e060180781b29055efd91a"' : 'data-bs-target="#xs-injectables-links-module-ReviewsServiceModule-5f29aa47d0c872ea9b9948520e1ee2ab5814c295fe90a355db588687b74f015fe5c7a941a236da1a45c88b22f69851de6205229b40e060180781b29055efd91a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ReviewsServiceModule-5f29aa47d0c872ea9b9948520e1ee2ab5814c295fe90a355db588687b74f015fe5c7a941a236da1a45c88b22f69851de6205229b40e060180781b29055efd91a"' :
                                        'id="xs-injectables-links-module-ReviewsServiceModule-5f29aa47d0c872ea9b9948520e1ee2ab5814c295fe90a355db588687b74f015fe5c7a941a236da1a45c88b22f69851de6205229b40e060180781b29055efd91a"' }>
                                        <li class="link">
                                            <a href="injectables/ReviewRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReviewRepository</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RmqModule.html" data-type="entity-link" >RmqModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RmqModule-8cfade89f9658c66d2a14322978a35fa5944b00e9377cd47952e65eae6de44695e0598bf91660ea92b1ce26c6fce5615ecebe1c170999333d3cb1a1f9e2c877a"' : 'data-bs-target="#xs-injectables-links-module-RmqModule-8cfade89f9658c66d2a14322978a35fa5944b00e9377cd47952e65eae6de44695e0598bf91660ea92b1ce26c6fce5615ecebe1c170999333d3cb1a1f9e2c877a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RmqModule-8cfade89f9658c66d2a14322978a35fa5944b00e9377cd47952e65eae6de44695e0598bf91660ea92b1ce26c6fce5615ecebe1c170999333d3cb1a1f9e2c877a"' :
                                        'id="xs-injectables-links-module-RmqModule-8cfade89f9658c66d2a14322978a35fa5944b00e9377cd47952e65eae6de44695e0598bf91660ea92b1ce26c6fce5615ecebe1c170999333d3cb1a1f9e2c877a"' }>
                                        <li class="link">
                                            <a href="injectables/RmqService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RmqService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersServiceModule.html" data-type="entity-link" >UsersServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersServiceModule-4c1a9f3b29324f42f71e7f5078ec9797b9dd4693dbc85624b6c3c99c1f42951cbf9a679fb12f67bbd75a7641b081e23dd1ccd7ce3461236b14afcedef28c2244"' : 'data-bs-target="#xs-controllers-links-module-UsersServiceModule-4c1a9f3b29324f42f71e7f5078ec9797b9dd4693dbc85624b6c3c99c1f42951cbf9a679fb12f67bbd75a7641b081e23dd1ccd7ce3461236b14afcedef28c2244"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersServiceModule-4c1a9f3b29324f42f71e7f5078ec9797b9dd4693dbc85624b6c3c99c1f42951cbf9a679fb12f67bbd75a7641b081e23dd1ccd7ce3461236b14afcedef28c2244"' :
                                            'id="xs-controllers-links-module-UsersServiceModule-4c1a9f3b29324f42f71e7f5078ec9797b9dd4693dbc85624b6c3c99c1f42951cbf9a679fb12f67bbd75a7641b081e23dd1ccd7ce3461236b14afcedef28c2244"' }>
                                            <li class="link">
                                                <a href="controllers/AddressBookServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddressBookServiceController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/UsersServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersServiceController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersServiceModule-4c1a9f3b29324f42f71e7f5078ec9797b9dd4693dbc85624b6c3c99c1f42951cbf9a679fb12f67bbd75a7641b081e23dd1ccd7ce3461236b14afcedef28c2244"' : 'data-bs-target="#xs-injectables-links-module-UsersServiceModule-4c1a9f3b29324f42f71e7f5078ec9797b9dd4693dbc85624b6c3c99c1f42951cbf9a679fb12f67bbd75a7641b081e23dd1ccd7ce3461236b14afcedef28c2244"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersServiceModule-4c1a9f3b29324f42f71e7f5078ec9797b9dd4693dbc85624b6c3c99c1f42951cbf9a679fb12f67bbd75a7641b081e23dd1ccd7ce3461236b14afcedef28c2244"' :
                                        'id="xs-injectables-links-module-UsersServiceModule-4c1a9f3b29324f42f71e7f5078ec9797b9dd4693dbc85624b6c3c99c1f42951cbf9a679fb12f67bbd75a7641b081e23dd1ccd7ce3461236b14afcedef28c2244"' }>
                                        <li class="link">
                                            <a href="injectables/AddressBookRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddressBookRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AddressBookService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddressBookService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserRepository</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/VendorsModule.html" data-type="entity-link" >VendorsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-VendorsModule-269275dadf9c2ac82f73eb53036a84ab3392f186cd1709701cff30bf593acc5164a58f1acdb64fcb76f98038209b0777011f6747a6570f448bebeb9b2ca37fb7"' : 'data-bs-target="#xs-controllers-links-module-VendorsModule-269275dadf9c2ac82f73eb53036a84ab3392f186cd1709701cff30bf593acc5164a58f1acdb64fcb76f98038209b0777011f6747a6570f448bebeb9b2ca37fb7"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-VendorsModule-269275dadf9c2ac82f73eb53036a84ab3392f186cd1709701cff30bf593acc5164a58f1acdb64fcb76f98038209b0777011f6747a6570f448bebeb9b2ca37fb7"' :
                                            'id="xs-controllers-links-module-VendorsModule-269275dadf9c2ac82f73eb53036a84ab3392f186cd1709701cff30bf593acc5164a58f1acdb64fcb76f98038209b0777011f6747a6570f448bebeb9b2ca37fb7"' }>
                                            <li class="link">
                                                <a href="controllers/VendorsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VendorsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-VendorsModule-269275dadf9c2ac82f73eb53036a84ab3392f186cd1709701cff30bf593acc5164a58f1acdb64fcb76f98038209b0777011f6747a6570f448bebeb9b2ca37fb7"' : 'data-bs-target="#xs-injectables-links-module-VendorsModule-269275dadf9c2ac82f73eb53036a84ab3392f186cd1709701cff30bf593acc5164a58f1acdb64fcb76f98038209b0777011f6747a6570f448bebeb9b2ca37fb7"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-VendorsModule-269275dadf9c2ac82f73eb53036a84ab3392f186cd1709701cff30bf593acc5164a58f1acdb64fcb76f98038209b0777011f6747a6570f448bebeb9b2ca37fb7"' :
                                        'id="xs-injectables-links-module-VendorsModule-269275dadf9c2ac82f73eb53036a84ab3392f186cd1709701cff30bf593acc5164a58f1acdb64fcb76f98038209b0777011f6747a6570f448bebeb9b2ca37fb7"' }>
                                        <li class="link">
                                            <a href="injectables/VendorRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VendorRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/VendorSettingsRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VendorSettingsRepository</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AddressBookController.html" data-type="entity-link" >AddressBookController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AddressBookLabelController.html" data-type="entity-link" >AddressBookLabelController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AdminController.html" data-type="entity-link" >AdminController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController-1.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController-2.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DashboardController.html" data-type="entity-link" >DashboardController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DeliveriesController.html" data-type="entity-link" >DeliveriesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DriversAuthController.html" data-type="entity-link" >DriversAuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DriversController.html" data-type="entity-link" >DriversController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DriversController-1.html" data-type="entity-link" >DriversController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DriversServiceController.html" data-type="entity-link" >DriversServiceController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DriverTransactionController.html" data-type="entity-link" >DriverTransactionController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DriverWalletController.html" data-type="entity-link" >DriverWalletController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/GeneralController.html" data-type="entity-link" >GeneralController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ListingController.html" data-type="entity-link" >ListingController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ListingsController-1.html" data-type="entity-link" >ListingsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ListingsController-2.html" data-type="entity-link" >ListingsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/LocationController-1.html" data-type="entity-link" >LocationController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/OdsaController.html" data-type="entity-link" >OdsaController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/OrderController.html" data-type="entity-link" >OrderController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/OrdersController.html" data-type="entity-link" >OrdersController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/OrdersController-1.html" data-type="entity-link" >OrdersController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/PaymentController.html" data-type="entity-link" >PaymentController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ReviewController.html" data-type="entity-link" >ReviewController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ReviewController-1.html" data-type="entity-link" >ReviewController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ReviewsController.html" data-type="entity-link" >ReviewsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UsersController.html" data-type="entity-link" >UsersController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/VendorController.html" data-type="entity-link" >VendorController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/VendorController-1.html" data-type="entity-link" >VendorController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/VendorsController-1.html" data-type="entity-link" >VendorsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/WalletController.html" data-type="entity-link" >WalletController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AbstractDocument.html" data-type="entity-link" >AbstractDocument</a>
                            </li>
                            <li class="link">
                                <a href="classes/AbstractRepository.html" data-type="entity-link" >AbstractRepository</a>
                            </li>
                            <li class="link">
                                <a href="classes/AddressBook.html" data-type="entity-link" >AddressBook</a>
                            </li>
                            <li class="link">
                                <a href="classes/AddressBookDto.html" data-type="entity-link" >AddressBookDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AddressBookLabel.html" data-type="entity-link" >AddressBookLabel</a>
                            </li>
                            <li class="link">
                                <a href="classes/AddressBookLabelDto.html" data-type="entity-link" >AddressBookLabelDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Admin.html" data-type="entity-link" >Admin</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChargeWithBankTransferDto.html" data-type="entity-link" >ChargeWithBankTransferDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChargeWithUssdDto.html" data-type="entity-link" >ChargeWithUssdDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateListingCategoryDto.html" data-type="entity-link" >CreateListingCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateListingMenuDto.html" data-type="entity-link" >CreateListingMenuDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateOptionGroupDto.html" data-type="entity-link" >CreateOptionGroupDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateScheduledListingDto.html" data-type="entity-link" >CreateScheduledListingDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateSubscriptionDto.html" data-type="entity-link" >CreateSubscriptionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/createTransaction.html" data-type="entity-link" >createTransaction</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateVendorDto.html" data-type="entity-link" >CreateVendorDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreditWallet.html" data-type="entity-link" >CreditWallet</a>
                            </li>
                            <li class="link">
                                <a href="classes/DebitWallet.html" data-type="entity-link" >DebitWallet</a>
                            </li>
                            <li class="link">
                                <a href="classes/Delivery.html" data-type="entity-link" >Delivery</a>
                            </li>
                            <li class="link">
                                <a href="classes/Driver.html" data-type="entity-link" >Driver</a>
                            </li>
                            <li class="link">
                                <a href="classes/DriverWallet.html" data-type="entity-link" >DriverWallet</a>
                            </li>
                            <li class="link">
                                <a href="classes/DriverWalletTransaction.html" data-type="entity-link" >DriverWalletTransaction</a>
                            </li>
                            <li class="link">
                                <a href="classes/EventsGateway.html" data-type="entity-link" >EventsGateway</a>
                            </li>
                            <li class="link">
                                <a href="classes/ExceptionFilterRpc.html" data-type="entity-link" >ExceptionFilterRpc</a>
                            </li>
                            <li class="link">
                                <a href="classes/ExportPushNotificationClient.html" data-type="entity-link" >ExportPushNotificationClient</a>
                            </li>
                            <li class="link">
                                <a href="classes/FitHttpException.html" data-type="entity-link" >FitHttpException</a>
                            </li>
                            <li class="link">
                                <a href="classes/FitRpcException.html" data-type="entity-link" >FitRpcException</a>
                            </li>
                            <li class="link">
                                <a href="classes/InitiateChargeDto.html" data-type="entity-link" >InitiateChargeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="classes/JwtAuthGuard-1.html" data-type="entity-link" >JwtAuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="classes/JwtAuthGuard-2.html" data-type="entity-link" >JwtAuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="classes/JwtAuthGuard-3.html" data-type="entity-link" >JwtAuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListingCategory.html" data-type="entity-link" >ListingCategory</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListingCategoryModel.html" data-type="entity-link" >ListingCategoryModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListingGroupOptionModel.html" data-type="entity-link" >ListingGroupOptionModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListingMenu.html" data-type="entity-link" >ListingMenu</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListingMenuModel.html" data-type="entity-link" >ListingMenuModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListingOptionEntityDto.html" data-type="entity-link" >ListingOptionEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ListingOptionGroup.html" data-type="entity-link" >ListingOptionGroup</a>
                            </li>
                            <li class="link">
                                <a href="classes/LocalGuard.html" data-type="entity-link" >LocalGuard</a>
                            </li>
                            <li class="link">
                                <a href="classes/LocalGuard-1.html" data-type="entity-link" >LocalGuard</a>
                            </li>
                            <li class="link">
                                <a href="classes/LocalGuard-2.html" data-type="entity-link" >LocalGuard</a>
                            </li>
                            <li class="link">
                                <a href="classes/LocalGuard-3.html" data-type="entity-link" >LocalGuard</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoggerConfig.html" data-type="entity-link" >LoggerConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/loginUserRequest.html" data-type="entity-link" >loginUserRequest</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginVendorRequest.html" data-type="entity-link" >LoginVendorRequest</a>
                            </li>
                            <li class="link">
                                <a href="classes/MockModel.html" data-type="entity-link" >MockModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/Order.html" data-type="entity-link" >Order</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderBreakDownDto.html" data-type="entity-link" >OrderBreakDownDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderDto.html" data-type="entity-link" >OrderDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderModel.html" data-type="entity-link" >OrderModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderStatusUpdateDto.html" data-type="entity-link" >OrderStatusUpdateDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Payment.html" data-type="entity-link" >Payment</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaymentModel.html" data-type="entity-link" >PaymentModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/PayoutModel.html" data-type="entity-link" >PayoutModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/PhoneVerificationPayload.html" data-type="entity-link" >PhoneVerificationPayload</a>
                            </li>
                            <li class="link">
                                <a href="classes/PlaceOrderDto.html" data-type="entity-link" >PlaceOrderDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PreciseLocationDto.html" data-type="entity-link" >PreciseLocationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReasonDto.html" data-type="entity-link" >ReasonDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterAdminDTO.html" data-type="entity-link" >RegisterAdminDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterDriverDto.html" data-type="entity-link" >RegisterDriverDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/registerUserRequest.html" data-type="entity-link" >registerUserRequest</a>
                            </li>
                            <li class="link">
                                <a href="classes/Review.html" data-type="entity-link" >Review</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReviewDto.html" data-type="entity-link" >ReviewDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReviewModel.html" data-type="entity-link" >ReviewModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/ScheduledListing.html" data-type="entity-link" >ScheduledListing</a>
                            </li>
                            <li class="link">
                                <a href="classes/ScheduledListingNotification.html" data-type="entity-link" >ScheduledListingNotification</a>
                            </li>
                            <li class="link">
                                <a href="classes/SendApprovalPushNotification.html" data-type="entity-link" >SendApprovalPushNotification</a>
                            </li>
                            <li class="link">
                                <a href="classes/SubscribeDto.html" data-type="entity-link" >SubscribeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateAdminLevelRequestDto.html" data-type="entity-link" >UpdateAdminLevelRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateDeliveryStatusDto.html" data-type="entity-link" >UpdateDeliveryStatusDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateListingCategoryDto.html" data-type="entity-link" >UpdateListingCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateOptionGroupDto.html" data-type="entity-link" >UpdateOptionGroupDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateOrderStatusPaidRequestDto.html" data-type="entity-link" >UpdateOrderStatusPaidRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateOrderStatusRequestDto.html" data-type="entity-link" >UpdateOrderStatusRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateSubscriptionByVendorDto.html" data-type="entity-link" >UpdateSubscriptionByVendorDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateTransaction.html" data-type="entity-link" >UpdateTransaction</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateVendorProfileDto.html" data-type="entity-link" >UpdateVendorProfileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateVendorSettingsDto.html" data-type="entity-link" >UpdateVendorSettingsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateVendorStatus.html" data-type="entity-link" >UpdateVendorStatus</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserDto.html" data-type="entity-link" >UserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserModel.html" data-type="entity-link" >UserModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserWallet.html" data-type="entity-link" >UserWallet</a>
                            </li>
                            <li class="link">
                                <a href="classes/Vendor.html" data-type="entity-link" >Vendor</a>
                            </li>
                            <li class="link">
                                <a href="classes/VendorModel.html" data-type="entity-link" >VendorModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/VendorPayout.html" data-type="entity-link" >VendorPayout</a>
                            </li>
                            <li class="link">
                                <a href="classes/VendorSettings.html" data-type="entity-link" >VendorSettings</a>
                            </li>
                            <li class="link">
                                <a href="classes/VendorSettingsModel.html" data-type="entity-link" >VendorSettingsModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/verifyPhoneRequest.html" data-type="entity-link" >verifyPhoneRequest</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService-1.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService-2.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService-3.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AwsService.html" data-type="entity-link" >AwsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DriverRepository.html" data-type="entity-link" >DriverRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DriversServiceService.html" data-type="entity-link" >DriversServiceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EventsService.html" data-type="entity-link" >EventsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy-1.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy-2.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy-3.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ListingsService.html" data-type="entity-link" >ListingsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalStrategy.html" data-type="entity-link" >LocalStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalStrategy-1.html" data-type="entity-link" >LocalStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalStrategy-2.html" data-type="entity-link" >LocalStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalStrategy-3.html" data-type="entity-link" >LocalStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ODSA.html" data-type="entity-link" >ODSA</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OdsaRepository.html" data-type="entity-link" >OdsaRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrdersServiceService.html" data-type="entity-link" >OrdersServiceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaymentService.html" data-type="entity-link" >PaymentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaystackService.html" data-type="entity-link" >PaystackService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReviewsService.html" data-type="entity-link" >ReviewsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService.html" data-type="entity-link" >UsersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VendorPayoutService.html" data-type="entity-link" >VendorPayoutService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VendorsService.html" data-type="entity-link" >VendorsService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AddressBookDto.html" data-type="entity-link" >AddressBookDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AddressBookI.html" data-type="entity-link" >AddressBookI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AddressBookLabelDto.html" data-type="entity-link" >AddressBookLabelDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AddressLabelI.html" data-type="entity-link" >AddressLabelI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AdminI.html" data-type="entity-link" >AdminI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AppConstants.html" data-type="entity-link" >AppConstants</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AppConstants-1.html" data-type="entity-link" >AppConstants</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BankTransferAccountDetails.html" data-type="entity-link" >BankTransferAccountDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BankTransferAccountDetails-1.html" data-type="entity-link" >BankTransferAccountDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BankTransferRequest.html" data-type="entity-link" >BankTransferRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BankTransferRequest-1.html" data-type="entity-link" >BankTransferRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BaseChargeRequest.html" data-type="entity-link" >BaseChargeRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BaseChargeRequest-1.html" data-type="entity-link" >BaseChargeRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BasePushMessage.html" data-type="entity-link" >BasePushMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartConstants.html" data-type="entity-link" >CartConstants</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartConstants-1.html" data-type="entity-link" >CartConstants</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChargeSuccessEvent.html" data-type="entity-link" >ChargeSuccessEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChargeWithBankTransferDto.html" data-type="entity-link" >ChargeWithBankTransferDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChargeWithUssdDto.html" data-type="entity-link" >ChargeWithUssdDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CheckUserAccountI.html" data-type="entity-link" >CheckUserAccountI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateListingCategoryDto.html" data-type="entity-link" >CreateListingCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateListingMenuDto.html" data-type="entity-link" >CreateListingMenuDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateOptionGroupDto.html" data-type="entity-link" >CreateOptionGroupDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateVendorDto.html" data-type="entity-link" >CreateVendorDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreditCardCharge.html" data-type="entity-link" >CreditCardCharge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreditCardCharge-1.html" data-type="entity-link" >CreditCardCharge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreditChargeRequest.html" data-type="entity-link" >CreditChargeRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreditChargeRequest-1.html" data-type="entity-link" >CreditChargeRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CustomOptions.html" data-type="entity-link" >CustomOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CustomOptions-1.html" data-type="entity-link" >CustomOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeliveryFeeResult.html" data-type="entity-link" >DeliveryFeeResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeliveryFeeResult-1.html" data-type="entity-link" >DeliveryFeeResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeliveryI.html" data-type="entity-link" >DeliveryI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeliveryI-1.html" data-type="entity-link" >DeliveryI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeliveryPriceMeta.html" data-type="entity-link" >DeliveryPriceMeta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeliveryPriceMeta-1.html" data-type="entity-link" >DeliveryPriceMeta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeliveryTaskStream.html" data-type="entity-link" >DeliveryTaskStream</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeliveryTaskStream-1.html" data-type="entity-link" >DeliveryTaskStream</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverCommissionMeta.html" data-type="entity-link" >DriverCommissionMeta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverI.html" data-type="entity-link" >DriverI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverI-1.html" data-type="entity-link" >DriverI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverStatGroup.html" data-type="entity-link" >DriverStatGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverStatGroup-1.html" data-type="entity-link" >DriverStatGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverStats.html" data-type="entity-link" >DriverStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverStats-1.html" data-type="entity-link" >DriverStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverWalletI.html" data-type="entity-link" >DriverWalletI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverWalletI-1.html" data-type="entity-link" >DriverWalletI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverWalletTransactionI.html" data-type="entity-link" >DriverWalletTransactionI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverWalletTransactionI-1.html" data-type="entity-link" >DriverWalletTransactionI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverWithLocation.html" data-type="entity-link" >DriverWithLocation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverWithLocation-1.html" data-type="entity-link" >DriverWithLocation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IdPayload.html" data-type="entity-link" >IdPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRpcException.html" data-type="entity-link" >IRpcException</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingApprovePush.html" data-type="entity-link" >ListingApprovePush</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingCategoryI.html" data-type="entity-link" >ListingCategoryI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingCategoryI-1.html" data-type="entity-link" >ListingCategoryI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingMenuI.html" data-type="entity-link" >ListingMenuI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingMenuI-1.html" data-type="entity-link" >ListingMenuI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingMenuReview.html" data-type="entity-link" >ListingMenuReview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingMenuReview-1.html" data-type="entity-link" >ListingMenuReview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingOption.html" data-type="entity-link" >ListingOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingOption-1.html" data-type="entity-link" >ListingOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingOptionEntityDto.html" data-type="entity-link" >ListingOptionEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingOptionGroupI.html" data-type="entity-link" >ListingOptionGroupI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingOptionGroupI-1.html" data-type="entity-link" >ListingOptionGroupI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListingRejectPush.html" data-type="entity-link" >ListingRejectPush</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LocationCoordinates.html" data-type="entity-link" >LocationCoordinates</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LocationCoordinates-1.html" data-type="entity-link" >LocationCoordinates</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/loginUserRequest.html" data-type="entity-link" >loginUserRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginVendorRequest.html" data-type="entity-link" >LoginVendorRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MultiPurposeServicePayload.html" data-type="entity-link" >MultiPurposeServicePayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderBreakDown.html" data-type="entity-link" >OrderBreakDown</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderBreakDown-1.html" data-type="entity-link" >OrderBreakDown</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderBreakDownDto.html" data-type="entity-link" >OrderBreakDownDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderDto.html" data-type="entity-link" >OrderDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderGroup.html" data-type="entity-link" >OrderGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderGroup-1.html" data-type="entity-link" >OrderGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderI.html" data-type="entity-link" >OrderI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderI-1.html" data-type="entity-link" >OrderI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderInitiateCharge.html" data-type="entity-link" >OrderInitiateCharge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderOptions.html" data-type="entity-link" >OrderOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderOptions-1.html" data-type="entity-link" >OrderOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrdersServiceServiceI.html" data-type="entity-link" >OrdersServiceServiceI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderStatusUpdateDto.html" data-type="entity-link" >OrderStatusUpdateDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderUpdateStream.html" data-type="entity-link" >OrderUpdateStream</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentDetails.html" data-type="entity-link" >PaymentDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentDetails-1.html" data-type="entity-link" >PaymentDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentI.html" data-type="entity-link" >PaymentI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentInfo.html" data-type="entity-link" >PaymentInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentInfo-1.html" data-type="entity-link" >PaymentInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentRequestSuccessEvent.html" data-type="entity-link" >PaymentRequestSuccessEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentServiceI.html" data-type="entity-link" >PaymentServiceI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PayoutOverview.html" data-type="entity-link" >PayoutOverview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PayoutOverview-1.html" data-type="entity-link" >PayoutOverview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaystackCharge.html" data-type="entity-link" >PaystackCharge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaystackCharge-1.html" data-type="entity-link" >PaystackCharge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaystackChargeResponse.html" data-type="entity-link" >PaystackChargeResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaystackChargeResponse-1.html" data-type="entity-link" >PaystackChargeResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaystackChargeResponseData.html" data-type="entity-link" >PaystackChargeResponseData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaystackChargeResponseData-1.html" data-type="entity-link" >PaystackChargeResponseData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PhoneVerificationPayload.html" data-type="entity-link" >PhoneVerificationPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PlaceOrderDto.html" data-type="entity-link" >PlaceOrderDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PushMessage.html" data-type="entity-link" >PushMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RegisterAdminDTO.html" data-type="entity-link" >RegisterAdminDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RegisterDriverDto.html" data-type="entity-link" >RegisterDriverDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/registerUserRequest.html" data-type="entity-link" >registerUserRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResponseWithStatus.html" data-type="entity-link" >ResponseWithStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResponseWithStatus-1.html" data-type="entity-link" >ResponseWithStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResponseWithStatusAndData.html" data-type="entity-link" >ResponseWithStatusAndData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResponseWithStatusAndData-1.html" data-type="entity-link" >ResponseWithStatusAndData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReviewDto.html" data-type="entity-link" >ReviewDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReviewI.html" data-type="entity-link" >ReviewI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReviewI-1.html" data-type="entity-link" >ReviewI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReviewServiceGetMostReviewed.html" data-type="entity-link" >ReviewServiceGetMostReviewed</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReviewsServiceI.html" data-type="entity-link" >ReviewsServiceI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReviewToken.html" data-type="entity-link" >ReviewToken</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReviewToken-1.html" data-type="entity-link" >ReviewToken</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RmqModuleOptions.html" data-type="entity-link" >RmqModuleOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScheduledListingDto.html" data-type="entity-link" >ScheduledListingDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScheduledListingDto-1.html" data-type="entity-link" >ScheduledListingDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScheduledListingI.html" data-type="entity-link" >ScheduledListingI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScheduledListingI-1.html" data-type="entity-link" >ScheduledListingI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScheduledPushPayload.html" data-type="entity-link" >ScheduledPushPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendPayoutEmail.html" data-type="entity-link" >SendPayoutEmail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendPayoutEmail-1.html" data-type="entity-link" >SendPayoutEmail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendVendorSignUpEmail.html" data-type="entity-link" >SendVendorSignUpEmail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendVendorSignUpEmail-1.html" data-type="entity-link" >SendVendorSignUpEmail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ServicePayload.html" data-type="entity-link" >ServicePayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SubscriptionNotification.html" data-type="entity-link" >SubscriptionNotification</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SubscriptionNotificationI.html" data-type="entity-link" >SubscriptionNotificationI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupportedPaymentType.html" data-type="entity-link" >SupportedPaymentType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupportedPaymentType-1.html" data-type="entity-link" >SupportedPaymentType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TokenPayload.html" data-type="entity-link" >TokenPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TokenPayload-1.html" data-type="entity-link" >TokenPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransactionData.html" data-type="entity-link" >TransactionData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransactionVerificationResponse.html" data-type="entity-link" >TransactionVerificationResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TravelDistanceResult.html" data-type="entity-link" >TravelDistanceResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TravelDistanceResult-1.html" data-type="entity-link" >TravelDistanceResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateAdminLevelRequestDto.html" data-type="entity-link" >UpdateAdminLevelRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateListingCategoryDto.html" data-type="entity-link" >UpdateListingCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateOptionGroupDto.html" data-type="entity-link" >UpdateOptionGroupDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateOrderStatusPaidRequestDto.html" data-type="entity-link" >UpdateOrderStatusPaidRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateOrderStatusRequestDto.html" data-type="entity-link" >UpdateOrderStatusRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateVendorProfileDto.html" data-type="entity-link" >UpdateVendorProfileDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateVendorSettingsDto.html" data-type="entity-link" >UpdateVendorSettingsDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateVendorStatus.html" data-type="entity-link" >UpdateVendorStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserDto.html" data-type="entity-link" >UserDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserHomePage.html" data-type="entity-link" >UserHomePage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserHomePage-1.html" data-type="entity-link" >UserHomePage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserI.html" data-type="entity-link" >UserI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserI-1.html" data-type="entity-link" >UserI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserWalletI.html" data-type="entity-link" >UserWalletI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UssdCharge.html" data-type="entity-link" >UssdCharge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UssdCharge-1.html" data-type="entity-link" >UssdCharge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UssdRequest.html" data-type="entity-link" >UssdRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UssdRequest-1.html" data-type="entity-link" >UssdRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorApprovedPush.html" data-type="entity-link" >VendorApprovedPush</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorI.html" data-type="entity-link" >VendorI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorI-1.html" data-type="entity-link" >VendorI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorOperationSetting.html" data-type="entity-link" >VendorOperationSetting</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorOperationSetting-1.html" data-type="entity-link" >VendorOperationSetting</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorPayoutI.html" data-type="entity-link" >VendorPayoutI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorPayoutServiceI.html" data-type="entity-link" >VendorPayoutServiceI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorRatings.html" data-type="entity-link" >VendorRatings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorRejectPush.html" data-type="entity-link" >VendorRejectPush</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorReviewOverview.html" data-type="entity-link" >VendorReviewOverview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorReviewOverview-1.html" data-type="entity-link" >VendorReviewOverview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorServiceHomePageResult.html" data-type="entity-link" >VendorServiceHomePageResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorSettingsI.html" data-type="entity-link" >VendorSettingsI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorSettingsI-1.html" data-type="entity-link" >VendorSettingsI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorSoldOutPush.html" data-type="entity-link" >VendorSoldOutPush</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorUserI.html" data-type="entity-link" >VendorUserI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorUserI-1.html" data-type="entity-link" >VendorUserI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorWithListing.html" data-type="entity-link" >VendorWithListing</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VendorWithListing-1.html" data-type="entity-link" >VendorWithListing</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/verifyPhoneRequest.html" data-type="entity-link" >verifyPhoneRequest</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});
