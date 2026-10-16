package com.gamingledger.purchases.controller;

import com.gamingledger.common.security.CurrentUserId;
import com.gamingledger.purchases.model.PurchaseRequest;
import com.gamingledger.purchases.model.Purchase;
import com.gamingledger.purchases.service.PurchaseService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/purchases")
public class PurchasesController {

    private final PurchaseService purchases;

    public PurchasesController(PurchaseService purchases) {
        this.purchases = purchases;
    }

    @GetMapping
    public List<Purchase> list(@CurrentUserId UUID userId) {
        return purchases.list(userId);
    }

    @PostMapping
    public Purchase create(@CurrentUserId UUID userId, @Valid @RequestBody PurchaseRequest body) {
        return purchases.create(userId, body);
    }

    @PutMapping("/{id}")
    public Purchase update(@CurrentUserId UUID userId, @PathVariable long id, @Valid @RequestBody PurchaseRequest body) {
        return purchases.update(userId, id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@CurrentUserId UUID userId, @PathVariable long id) {
        purchases.delete(userId, id);
    }
}
