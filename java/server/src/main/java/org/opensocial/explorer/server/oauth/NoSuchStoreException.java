package org.opensocial.explorer.server.oauth;

/**
 * This exception is thrown when we attempt to get a user's services with an ID
 * that does not exist in the Map store of {@link OSEOAuthStore}.
 */
public class NoSuchStoreException extends Exception {
  public NoSuchStoreException() {}
  
  public NoSuchStoreException(String message)
  {
     super(message);
  }
}
