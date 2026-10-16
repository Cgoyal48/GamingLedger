package com.gamingledger.purchases.mapper;

import com.gamingledger.datastore.jooq.codegen.tables.records.PurchasesRecord;
import com.gamingledger.purchases.model.Purchase;
import org.springframework.stereotype.Component;

@Component
public class PurchaseMapper {

    public Purchase toPurchase(PurchasesRecord r) {
        return new Purchase(
            r.getId(), r.getCopyId(), r.getKind(), r.getAmountMinor(),
            r.getCurrency(), r.getPurchasedAt(), r.getNote()
        );
    }
}
