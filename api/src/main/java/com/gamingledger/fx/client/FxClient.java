package com.gamingledger.fx.client;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class FxClient {

    private final RestClient http = RestClient.create("https://api.frankfurter.dev/v1");

    public Map<LocalDate, Map<String, BigDecimal>> eurRates(LocalDate from, LocalDate to) {
        RatesResponse body = http.get()
            .uri("/{from}..{to}?base=EUR", from, to)
            .retrieve()
            .body(RatesResponse.class);
        return body == null || body.rates() == null ? Map.of() : body.rates();
    }

    private record RatesResponse(Map<LocalDate, Map<String, BigDecimal>> rates) {}
}
