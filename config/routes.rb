# frozen_string_literal: true

Rails.application.routes.draw do
  get  "sign_in", to: "sessions#new", as: :sign_in
  post "sign_in", to: "sessions#create"
  get  "sign_up", to: "users#new", as: :sign_up
  post "sign_up", to: "users#create"

  resources :sessions, only: [:destroy]
  resource :users, only: [:destroy]

  namespace :identity do
    resource :email_verification, only: [:show, :create]
    resource :password_reset,     only: [:new, :edit, :create, :update]
  end

  get :dashboard, to: "dashboard#index"

  namespace :settings do
    get "/", to: "profiles#show"
    resource :profile, only: [:show, :update]
    resource :password, only: [:show, :update]
    resource :email, only: [:show, :update]
    resources :sessions, only: [:index]

    # Billing
    get :billing, to: "billing#index"
    post "billing/checkout", to: "billing#create_checkout_session"
    get "billing/checkout_success", to: "billing#checkout_success"
    post "billing/manage", to: "billing#manage_subscription"
    patch "billing/cancel", to: "billing#cancel_subscription"
    patch "billing/pause", to: "billing#pause_subscription"
    patch "billing/resume", to: "billing#resume_subscription"
  end

  inertia "settings/appearance" => "settings/appearance"

  root "home#index"
  resources :posts, only: [:index, :create]

  # ActionCable
  mount ActionCable.server => "/cable"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
