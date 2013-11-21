package org.opensocial.explorer.server.oauth2;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.shindig.common.Nullable;
import org.apache.shindig.common.crypto.BlobCrypter;
import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.common.util.ResourceLoader;
import org.apache.shindig.gadgets.GadgetException;
import org.apache.shindig.gadgets.oauth2.BasicOAuth2Store;
import org.apache.shindig.gadgets.oauth2.OAuth2FetcherConfig;
import org.apache.shindig.gadgets.oauth2.OAuth2Module;
import org.apache.shindig.gadgets.oauth2.OAuth2Store;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Cache;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Encrypter;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2PersistenceException;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Persister;
import org.apache.shindig.gadgets.oauth2.persistence.sample.JSONOAuth2Persister;
import org.opensocial.explorer.server.oauth.OSEOAuthStoreProvider;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

@Singleton
public class OSEOAuth2StoreProvider implements Provider<IOAuth2Store> {
  private static final String CLAZZ = OSEOAuth2StoreProvider.class.getName();
  private Logger LOG = Logger.getLogger(CLAZZ);
  
  private OSEOAuth2Store store;

  @Inject
  public OSEOAuth2StoreProvider(
      @Named(OAuth2Module.OAUTH2_REDIRECT_URI) final String globalRedirectUri,
      @Named(OAuth2Module.OAUTH2_IMPORT) final boolean importFromConfig,
      @Named(OAuth2Module.OAUTH2_IMPORT_CLEAN) final boolean importClean,
      final Authority authority, final IOAuth2Cache cache, final IOAuth2Persister persister,
      final OAuth2Encrypter encrypter,
      @Nullable @Named("shindig.contextroot") final String contextRoot,
      @Named(OAuth2FetcherConfig.OAUTH2_STATE_CRYPTER) final BlobCrypter stateCrypter) {

    this.store = new OSEOAuth2Store(cache, persister, encrypter, globalRedirectUri, authority,
            contextRoot, stateCrypter);
    loadClients();
/*
    if (importFromConfig) {
      try {
        final IOAuth2Persister source = new JSONOAuth2Persister(encrypter, authority,
                globalRedirectUri, contextRoot);
        OSEOAuth2Store.runImport(source, persister, importClean);
      } catch (final OAuth2PersistenceException e) {
        if (OAuth2Module.LOG.isLoggable()) {
          OAuth2Module.LOG.log("store init exception", e);
        }
      }
    } 

    try {
      this.store.init();
    } catch (final GadgetException e) {
      LOG.logp(Level.WARNING, CLAZZ, method, "store init exception", e);
      if (OAuth2Module.LOG.isLoggable()) {
        OAuth2Module.LOG.log("store init exception", e);
      }
    } */
  }
  
  protected void loadClients() {
    final String method = "loadClients";
    try {
      this.store.init();
    } catch (final GadgetException e) {
      LOG.logp(Level.WARNING, CLAZZ, method, "store init exception", e);
    }
  }

  public IOAuth2Store get() {
    return this.store;
  }
}