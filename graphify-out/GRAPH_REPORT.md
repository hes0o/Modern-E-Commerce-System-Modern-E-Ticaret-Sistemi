# Graph Report - modern e commerce  (2026-08-24)

## Corpus Check
- 219 files · ~63,163 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1380 nodes · 3816 edges · 125 communities (82 shown, 43 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 365 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- API Routes & Endpoints (BusinessRuleErro
- API Routes & Endpoints (AdminRoleName)
- API Routes & Endpoints (get_optional_cur
- Business Services (audit_middleware.py)
- API Routes & Endpoints (alias)
- API Routes & Endpoints (@/pages/orders/C
- Business Services (OrderStatusHistory)
- API Routes & Endpoints (get_current_user
- API Routes & Endpoints (ConflictError)
- Core Module 9 (exceptions.py)
- API Routes & Endpoints (favorite.py)
- Business Services (Stock movement types 
- Business Services (ProductVariant)
- Business Services (setting.py)
- API Routes & Endpoints (reports.py)
- API Routes & Endpoints (ProductImage)
- API Routes & Endpoints (get_stock_moveme
- Business Services (notification.py)
- Business Services (order_state_machine.p
- Data Models & Schemas (OrderStatus)
- API Routes & Endpoints (categories.py)
- API Routes & Endpoints (dependencies.py)
- Data Models & Schemas (rbac.py)
- Core Module 23 (autoprefixer)
- Core Module 24 (axios)
- API Routes & Endpoints (get_session())
- API Routes & Endpoints (create_setting()
- Test Suite (Session)
- API Routes & Endpoints (rbac.py)
- API Routes & Endpoints (dashboard.py)
- API Routes & Endpoints (create_variant()
- Business Services (InvalidStateTransitio
- Frontend UI (CargoLabelModal.jsx)
- Core Module 33 (constants.js)
- Core Module 34 (__init__.py)
- Core Module 35 (AdminLayout.jsx)
- Test Suite (Cart items should be removed
- Business Services (rbac_repository.py)
- Data Models & Schemas (base.py)
- API Routes & Endpoints (create_product_i
- Core Module 40 (package.json)
- Test Suite (All permissions should follo
- Data Models & Schemas (User role definit
- API Routes & Endpoints (Depends)
- Frontend UI (AddressesPage.jsx)
- Core Module 46 (env.py)
- Core Module 47 (App.jsx)
- Frontend UI (DataTable.jsx)
- Frontend UI (CheckoutPage.jsx)
- Frontend UI (HomePage.jsx)
- Frontend UI (OrderHistoryPage.jsx)
- Core Module 52 (002_audit_log_protection
- Frontend UI (ProductCard.jsx)
- Core Module 54 (StorefrontLayout.jsx)
- Frontend UI (ProductDetailPage.jsx)
- Frontend UI (ShopPage.jsx)
- Frontend UI (Badge.jsx)
- Frontend UI (ConfirmDialog.jsx)
- Frontend UI (ProductForm.jsx)
- Core Module 60 (CartContext.jsx)
- Frontend UI (AccountPage.jsx)
- Frontend UI (CustomerLoginPage.jsx)
- Frontend UI (FavoritesPage.jsx)
- Frontend UI (ProfilePage.jsx)
- Frontend UI (GlobalSearch.jsx)
- Frontend UI (StatCard.jsx)
- Core Module 72 (AuthContext.jsx)
- Frontend UI (DashboardPage.jsx)
- Frontend UI (NotificationsPage.jsx)
- Frontend UI (OrderListPage.jsx)
- Frontend UI (PendingOrdersPage.jsx)
- Frontend UI (ProductFormPage.jsx)
- Frontend UI (ReportsPage.jsx)
- Frontend UI (RolesPage.jsx)
- Frontend UI (SettingsPage.jsx)
- Frontend UI (CartPage.jsx)
- Frontend UI (UsersPage.jsx)
- Business Services (cartService.js)
- Business Services (userService.js)
- Core Module 85 (eslint)
- Core Module 86 (eslint-plugin-react-hook
- Core Module 87 (eslint-plugin-react-refr
- Core Module 88 (react-hot-toast)
- Business Services (addressService.js)
- Business Services (api.js)
- Business Services (authService.js)
- Business Services (favoriteService.js)
- Business Services (orderService.js)
- Business Services (productService.js)
- Business Services (stockService.js)
- Core Module 109 (package.json)
- Core Module 117 (Docker Compose Setup)
- Core Module 118 (API Integration Documen
- Core Module 120 (modern-ecommerce-db)

## God Nodes (most connected - your core abstractions)
1. `User` - 140 edges
2. `get_session()` - 96 edges
3. `ApiResponse` - 94 edges
4. `Product` - 65 edges
5. `require_permission()` - 63 edges
6. `NotFoundError` - 56 edges
7. `BusinessRuleError` - 44 edges
8. `OrderStatus` - 39 edges
9. `TimestampMixin` - 33 edges
10. `ProductStatus` - 33 edges

## Surprising Connections (you probably didn't know these)
- `TestOrderCreationHappyPath` --uses--> `CartItem`  [INFERRED]
  tests/test_order_transaction.py → app/models/cart.py
- `TestOrderCancellation` --uses--> `PaymentMethod`  [INFERRED]
  tests/test_order_transaction.py → app/models/enums.py
- `TestOrderCreationFailures` --uses--> `PaymentMethod`  [INFERRED]
  tests/test_order_transaction.py → app/models/enums.py
- `TestOrderCreationHappyPath` --uses--> `PaymentMethod`  [INFERRED]
  tests/test_order_transaction.py → app/models/enums.py
- `TestOrderStatusUpdate` --uses--> `PaymentMethod`  [INFERRED]
  tests/test_order_transaction.py → app/models/enums.py

## Import Cycles
- None detected.

## Communities (125 total, 43 thin omitted)

### Community 0 - "API Routes & Endpoints (BusinessRuleErro"
Cohesion: 0.06
Nodes (89): BusinessRuleError, Category, Product category with hierarchical tree structure., ProductStatus, Enumeration types used across the database schema. These are Python `enum.Enum`…, Product lifecycle status (SRS §5.2)., Product, Product models (SRS §17.7, §17.8, §17.9). Three related models: - `Product` —… (+81 more)

### Community 1 - "API Routes & Endpoints (AdminRoleName)"
Cohesion: 0.07
Nodes (67): AdminRoleName, Settings, AuthenticationError, create_access_token(), decode_access_token(), hash_password(), Any, verify_password() (+59 more)

### Community 2 - "API Routes & Endpoints (get_optional_cur"
Cohesion: 0.08
Nodes (62): get_optional_current_user(), Session, Return the current timezone.utc timestamp., utc_now(), Cart, CartItem, Cart models (SRS §17.10). Supports both registered users (`user_id`) and guest…, Shopping cart — one per registered user or guest session. (+54 more)

### Community 3 - "Business Services (audit_middleware.py)"
Cohesion: 0.06
Nodes (47): audited(), log_admin_action(), Any, Session, Decorator for automatically audit-logging changes made by a function. The…, Simple audit log for admin actions that don't have before/after state. Use for…, AuditLog, datetime (+39 more)

### Community 4 - "API Routes & Endpoints (alias)"
Cohesion: 0.12
Nodes (47): alias, NotFoundError, get_all_orders(), get_order_by_id(), get_order_by_number(), get_user_orders(), Session, admin_order_detail() (+39 more)

### Community 5 - "API Routes & Endpoints (@/pages/orders/C"
Cohesion: 0.05
Nodes (21): AdminProfilePage, CancelledOrdersPage, CategoriesBrandsPage, DashboardPage, DeliveredOrdersPage, NotificationsPage, OrderDetailPage, OrderListPage (+13 more)

### Community 6 - "Business Services (OrderStatusHistory)"
Cohesion: 0.09
Nodes (33): OrderStatusHistory, Immutable log of order status transitions (SRS §17.14). Every status change is…, cancel_order(), create_order(), EmptyCartError, _generate_order_number(), _get_effective_price(), OrderCreationError (+25 more)

### Community 7 - "API Routes & Endpoints (get_current_user"
Cohesion: 0.16
Nodes (35): get_current_user(), Depends, require_admin(), Address, Address model (SRS §17.4). Users can store multiple shipping/billing addresses.…, User delivery/billing address., delete_address(), get_address_by_id_and_user_id() (+27 more)

### Community 8 - "API Routes & Endpoints (ConflictError)"
Cohesion: 0.17
Nodes (31): ConflictError, Brand, Brand model (SRS §17.6). Simple lookup table for product brands with optional…, Product brand definition., get_brand_by_id(), get_brand_by_name(), get_brands(), Session (+23 more)

### Community 9 - "Core Module 9 (exceptions.py)"
Cohesion: 0.08
Nodes (20): AppError, ForbiddenError, Exception, app_error_handler(), Exception, Request, unexpected_error_handler(), validation_error_handler() (+12 more)

### Community 10 - "API Routes & Endpoints (favorite.py)"
Cohesion: 0.18
Nodes (25): Favorite, Favorite model (SRS §17.11). Links registered users to products they've…, User ↔ Product wishlist entry., create_favorite(), delete_favorite(), get_favorite_by_id_and_user_id(), get_favorite_by_user_and_product(), get_favorites_by_user_id() (+17 more)

### Community 11 - "Business Services (Stock movement types "
Cohesion: 0.17
Nodes (25): Stock movement types (SRS §8.1). Each type determines whether stock is…, StockMovementType, Individual stock movement record (SRS §17.15). Every stock change — whether…, StockMovement, check_low_stock(), _get_current_stock(), InsufficientStockError, manual_stock_in() (+17 more)

### Community 12 - "Business Services (ProductVariant)"
Cohesion: 0.21
Nodes (23): ProductVariant, Product variant — color/size combination (SRS §17.9). Each variant has its own…, delete_variant(), get_product_variants(), get_variant_by_id_and_product_id(), get_variant_by_sku(), Session, save_variant() (+15 more)

### Community 13 - "Business Services (setting.py)"
Cohesion: 0.21
Nodes (23): Setting model (SRS §17.17). Key-value store for system configuration. Sensitive…, System configuration key-value pair., Setting, delete_setting(), get_setting_by_id(), get_setting_by_key(), get_settings(), Session (+15 more)

### Community 14 - "API Routes & Endpoints (reports.py)"
Cohesion: 0.18
Nodes (24): export_sales_report(), monthly_sales(), date, Depends, get, Query, Session, Dashboard Gelir Performansı grafiği için gerçek satış verileri. (+16 more)

### Community 15 - "API Routes & Endpoints (ProductImage)"
Cohesion: 0.20
Nodes (22): ProductImage, Product gallery image (SRS §17.8)., delete_product_image(), get_image_by_id_and_product_id(), get_product_images(), Session, save_product_image(), save_product_images() (+14 more)

### Community 16 - "API Routes & Endpoints (get_stock_moveme"
Cohesion: 0.19
Nodes (23): get_stock_movements(), get_stock_products(), Session, change_product_stock(), Depends, ge, get, le (+15 more)

### Community 17 - "Business Services (notification.py)"
Cohesion: 0.22
Nodes (21): Notification, Notification model (SRS §17.16). In-panel notifications for admin/personnel.…, Panel notification (new order, low stock, new member, etc.)., delete_notification(), get_notifications(), get_visible_notification_by_id(), Session, save_notification() (+13 more)

### Community 18 - "Business Services (order_state_machine.p"
Cohesion: 0.12
Nodes (13): get_allowed_transitions(), is_cancellable(), is_terminal(), Order State Machine (SRS §7.3). Enforces valid status transitions for orders.…, Return the set of statuses reachable from the current status., Check if a status is a terminal (final) state., Check if an order in this status can still be cancelled., Tests for the order state machine (SRS §7.3). Verifies that valid transitions… (+5 more)

### Community 19 - "Data Models & Schemas (OrderStatus)"
Cohesion: 0.19
Nodes (18): OrderStatus, PaymentMethod, Payment methods available in MVP (SRS §7.4)., Sipariş durumları — Order lifecycle status (SRS §7.3). Transitions are enforced…, Models package — re-exports all SQLModel table classes. Importing this module…, Order, OrderItem, Order models (SRS §17.12, §17.13, §17.14). Three related models: - `Order` —… (+10 more)

### Community 20 - "API Routes & Endpoints (categories.py)"
Cohesion: 0.24
Nodes (19): create_category(), create_category_response(), delete_category(), get_category_detail(), get_category_list(), delete, Depends, get (+11 more)

### Community 21 - "API Routes & Endpoints (dependencies.py)"
Cohesion: 0.29
Nodes (7): require_permission(), Database connection and session management. Provides the SQLAlchemy engine,…, User model (SRS §17.2). Holds both customer and admin/personnel accounts in a…, Registered user — customer, admin, or personnel., User, delete_notification(), delete

### Community 22 - "Data Models & Schemas (rbac.py)"
Cohesion: 0.17
Nodes (15): Permission, SQLModel, Role-Based Access Control (RBAC) models (SRS §3, §17.3). Implements a flexible…, Junction table linking roles to permissions (many-to-many)., Granular permission definition (e.g., "product.create", "order.update_status").…, RolePermission, Session, RBAC seed data (SRS §3). Populates roles, permissions, and role-permission… (+7 more)

### Community 23 - "Core Module 23 (autoprefixer)"
Cohesion: 0.12
Nodes (17): autoprefixer, globals, devDependencies, autoprefixer, globals, postcss, tailwindcss, @types/react (+9 more)

### Community 24 - "Core Module 24 (axios)"
Cohesion: 0.12
Nodes (17): axios, clsx, lucide-react, dependencies, axios, clsx, lucide-react, react (+9 more)

### Community 25 - "API Routes & Endpoints (get_session())"
Cohesion: 0.20
Nodes (15): get_session(), Session, Yield a database session, ensuring it is closed after use., delete_user(), delete, create_notification(), notification_list(), Depends (+7 more)

### Community 26 - "API Routes & Endpoints (create_setting()"
Cohesion: 0.17
Nodes (15): create_setting(), delete_setting(), BaseModel, delete, Depends, get, patch, post (+7 more)

### Community 27 - "Test Suite (Session)"
Cohesion: 0.18
Nodes (9): Session, Test that seed data is correctly created., All 3 roles should exist after seeding., All defined permissions should exist after seeding., Admin role should have every permission., Personnel should have only the defined subset of permissions., Customer role should have zero admin permissions., Running seed twice should not create duplicate records. (+1 more)

### Community 28 - "API Routes & Endpoints (rbac.py)"
Cohesion: 0.32
Nodes (12): permission_list(), Depends, get, put, Session, replace_role_permissions(), role_list(), PermissionResponse (+4 more)

### Community 29 - "API Routes & Endpoints (dashboard.py)"
Cohesion: 0.32
Nodes (10): dashboard_summary(), Depends, get, Session, DashboardSummary, MonthlyRevenue, BaseModel, TopSellingProduct (+2 more)

### Community 30 - "API Routes & Endpoints (create_variant()"
Cohesion: 0.22
Nodes (13): create_variant(), delete_variant(), delete, Depends, get, patch, post, ProductVariantCreate (+5 more)

### Community 31 - "Business Services (InvalidStateTransitio"
Cohesion: 0.15
Nodes (10): InvalidStateTransition, Exception, Raised when an order status transition violates the state machine rules., parametrize, Test that all valid transitions from the SRS are accepted., Valid transition should not raise an exception., Test that invalid transitions are rejected with clear errors., Invalid transition should raise InvalidStateTransition. (+2 more)

### Community 32 - "Frontend UI (CargoLabelModal.jsx)"
Cohesion: 0.19
Nodes (4): CargoLabelModal(), OrderDetailPage(), STATUS_CONFIG, STATUS_PIPELINE

### Community 33 - "Core Module 33 (constants.js)"
Cohesion: 0.15
Nodes (12): API_BASE_URL, APP_NAME, COLORS, ITEMS_PER_PAGE, LOW_STOCK_THRESHOLD, NAV_ITEMS, ORDER_STATUSES, PRODUCT_STATUSES (+4 more)

### Community 34 - "Core Module 34 (__init__.py)"
Cohesion: 0.21
Nodes (8): Seeds package — database seed runner. Run all seeds: python -m app.seeds, Execute all seed functions in dependency order., run_all_seeds(), Main entry point for running seeds. Run all seeds: python -m app.seeds, Session, Demo/default user seed — creates the admin and personnel accounts referenced by…, Create default admin/personnel users if they don't already exist., seed_users()

### Community 35 - "Core Module 35 (AdminLayout.jsx)"
Cohesion: 0.20
Nodes (5): Navbar(), PAGE_TITLES, ICON_MAP, navSections, Sidebar()

### Community 36 - "Test Suite (Cart items should be removed"
Cohesion: 0.17
Nodes (7): Cart items should be removed after successful order creation., Test successful order creation with stock deduction., Order should be created with correct financial calculations., Product stock should decrease by the ordered quantity., A 'reserved' stock movement should be logged., Initial 'pending' status should be recorded in history., TestOrderCreationHappyPath

### Community 37 - "Business Services (rbac_repository.py)"
Cohesion: 0.45
Nodes (9): get_all_permissions(), get_permissions_by_ids(), get_role_with_permissions(), get_roles_with_permissions(), Session, save_role(), list_roles(), Session (+1 more)

### Community 38 - "Data Models & Schemas (base.py)"
Cohesion: 0.27
Nodes (7): datetime, SQLModel, Shared timestamp fields for database models., Add creation and update timestamps to database models., TimestampMixin, Category model (SRS §17.5). Self-referencing tree structure via `parent_id`.…, Stock movement model (SRS §17.15). Records every stock change with before/after…

### Community 39 - "API Routes & Endpoints (create_product_i"
Cohesion: 0.22
Nodes (10): create_product_image(), delete_product_image(), delete, Depends, File, ge, post, Session (+2 more)

### Community 40 - "Core Module 40 (package.json)"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 41 - "Test Suite (All permissions should follo"
Cohesion: 0.20
Nodes (6): All permissions should follow 'module.action' format., Modules with CRUD operations should have create/read/update/delete., Personnel should NOT have settings permissions (SRS §3.2)., Personnel should NOT be able to assign roles (SRS §3.2)., Verify that permission names follow conventions and cover all modules., TestPermissionCoverage

### Community 42 - "Data Models & Schemas (User role definit"
Cohesion: 0.33
Nodes (7): User role definition (e.g., admin, personnel, customer). Each user is assigned…, Role, create_admin_token(), register_and_login(), test_admin_can_access_dashboard(), test_customer_cannot_access_admin_dashboard(), test_personnel_with_permission_can_access_dashboard()

### Community 43 - "API Routes & Endpoints (Depends)"
Cohesion: 0.22
Nodes (8): Depends, File, post, UploadFile, UploadFolder, upload_image(), ImageUploadResponse, BaseModel

### Community 45 - "Frontend UI (AddressesPage.jsx)"
Cohesion: 0.32
Nodes (5): AddressesPage(), handleDelete(), handleSave(), load(), EMPTY_FORM

### Community 46 - "Core Module 46 (env.py)"
Cohesion: 0.33
Nodes (5): Alembic environment configuration. Imports all SQLModel models to ensure they…, Run migrations in 'offline' mode — generates SQL script., Run migrations in 'online' mode — connects to the database., run_migrations_offline(), run_migrations_online()

### Community 47 - "Core Module 47 (App.jsx)"
Cohesion: 0.47
Nodes (3): App(), OrderContext, OrderProvider()

### Community 50 - "Frontend UI (HomePage.jsx)"
Cohesion: 0.33
Nodes (4): CATEGORY_CARDS, FEATURES, HERO_SLIDES, HomePage()

### Community 51 - "Frontend UI (OrderHistoryPage.jsx)"
Cohesion: 0.47
Nodes (4): formatDate(), formatPrice(), OrderHistoryPage(), STATUS_STYLES

### Community 52 - "Core Module 52 (002_audit_log_protection"
Cohesion: 0.40
Nodes (4): downgrade(), Apply append-only protection rules to audit_logs table., Remove append-only protection (for development/testing only)., upgrade()

### Community 56 - "Frontend UI (ShopPage.jsx)"
Cohesion: 0.50
Nodes (4): ShopPage(), handleSearch(), updateParam(), SORT_OPTIONS

## Knowledge Gaps
- **96 isolated node(s):** `type`, `Settings`, `name`, `private`, `version` (+91 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `API Routes & Endpoints (dependencies.py)` to `API Routes & Endpoints (BusinessRuleErro`, `API Routes & Endpoints (AdminRoleName)`, `API Routes & Endpoints (get_optional_cur`, `API Routes & Endpoints (alias)`, `API Routes & Endpoints (get_current_user`, `API Routes & Endpoints (ConflictError)`, `API Routes & Endpoints (favorite.py)`, `API Routes & Endpoints (reports.py)`, `API Routes & Endpoints (get_stock_moveme`, `Business Services (notification.py)`, `Data Models & Schemas (OrderStatus)`, `API Routes & Endpoints (categories.py)`, `API Routes & Endpoints (get_session())`, `API Routes & Endpoints (create_setting()`, `API Routes & Endpoints (rbac.py)`, `API Routes & Endpoints (dashboard.py)`, `API Routes & Endpoints (create_variant()`, `Core Module 34 (__init__.py)`, `Data Models & Schemas (base.py)`, `API Routes & Endpoints (create_product_i`, `Data Models & Schemas (User role definit`, `API Routes & Endpoints (Depends)`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Why does `Product` connect `API Routes & Endpoints (BusinessRuleErro` to `API Routes & Endpoints (get_optional_cur`, `Business Services (audit_middleware.py)`, `Data Models & Schemas (base.py)`, `Business Services (OrderStatusHistory)`, `API Routes & Endpoints (ConflictError)`, `API Routes & Endpoints (favorite.py)`, `Business Services (Stock movement types `, `Business Services (ProductVariant)`, `API Routes & Endpoints (ProductImage)`, `API Routes & Endpoints (get_stock_moveme`, `Business Services (notification.py)`, `Data Models & Schemas (OrderStatus)`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `get_session()` connect `API Routes & Endpoints (get_session())` to `API Routes & Endpoints (BusinessRuleErro`, `API Routes & Endpoints (AdminRoleName)`, `API Routes & Endpoints (get_optional_cur`, `API Routes & Endpoints (alias)`, `API Routes & Endpoints (get_current_user`, `API Routes & Endpoints (ConflictError)`, `API Routes & Endpoints (create_product_i`, `API Routes & Endpoints (favorite.py)`, `API Routes & Endpoints (reports.py)`, `API Routes & Endpoints (ProductImage)`, `API Routes & Endpoints (get_stock_moveme`, `API Routes & Endpoints (categories.py)`, `API Routes & Endpoints (dependencies.py)`, `API Routes & Endpoints (create_setting()`, `API Routes & Endpoints (rbac.py)`, `API Routes & Endpoints (dashboard.py)`, `API Routes & Endpoints (create_variant()`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Are the 101 inferred relationships involving `User` (e.g. with `get_current_user()` and `get_optional_current_user()`) actually correct?**
  _`User` has 101 INFERRED edges - model-reasoned connections that need verification._
- **Are the 32 inferred relationships involving `Product` (e.g. with `ProductStatus` and `get_dashboard_metrics()`) actually correct?**
  _`Product` has 32 INFERRED edges - model-reasoned connections that need verification._
- **What connects `type`, `Settings`, `name` to the rest of the system?**
  _96 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Routes & Endpoints (BusinessRuleErro` be split into smaller, more focused modules?**
  _Cohesion score 0.06129830573005901 - nodes in this community are weakly interconnected._