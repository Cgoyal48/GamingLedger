package com.gamingledger.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Thrown for rows that don't exist and rows owned by someone else, so the two look the same. */
public class NotFoundException extends ResponseStatusException {

    public NotFoundException() {
        super(HttpStatus.NOT_FOUND);
    }
}
