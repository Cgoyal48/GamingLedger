package com.gamingledger.igdb.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.gamingledger.igdb.model.IgdbGame;
import java.net.http.HttpClient;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class IgdbClient {

    private static final Logger log = LoggerFactory.getLogger(IgdbClient.class);

    private final RestClient http = RestClient.builder().requestFactory(timeouts()).build();
    private final String clientId;
    private final String clientSecret;
    private String token;
    private Instant expiresAt = Instant.EPOCH;

    public IgdbClient(
        @Value("${igdb.client-id}") String clientId,
        @Value("${igdb.client-secret}") String clientSecret
    ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    private synchronized String token() {
        if (Instant.now().isBefore(expiresAt)) {
            return token;
        }
        TokenResponse response = http.post()
            .uri(
                "https://id.twitch.tv/oauth2/token?client_id={id}&client_secret={secret}&grant_type=client_credentials",
                clientId,
                clientSecret
            )
            .retrieve()
            .body(TokenResponse.class);
        if (response == null || response.accessToken() == null || response.accessToken().isBlank()) {
            throw new IllegalStateException("Twitch did not return an access token");
        }
        token = response.accessToken();
        expiresAt = Instant.now().plusSeconds(Math.max(0, response.expiresIn() - 60));
        log.info("IGDB token acquired, length {}", token.length());
        return token;
    }

    /**
     * Game types: main game 0, bundle 3, standalone expansion 4, remake 8, remaster 9, expanded game 10, port 11.
     * Leaves out DLC, mods, episodes, seasons, packs and updates, which would flood the results.
     */
    public List<IgdbGame> search(String query) {
        String safe = query.replace("\\", "").replace("\"", "").trim();
        String body = "search \"" + safe + "\";\n"
            + "fields id,name,first_release_date,cover.image_id;\n"
            + "where game_type = (0,3,4,8,9,10,11);\n"
            + "limit 10;\n";
        return games(body).stream()
            .map(hit -> new IgdbGame(hit.id(), hit.name(), year(hit.firstReleaseDate()), coverUrl(hit.imageId())))
            .toList();
    }

    /** Cover image ids by IGDB game id. Games without a cover are left out. */
    public Map<Long, String> coverImageIds(Collection<Long> igdbIds) {
        if (igdbIds.isEmpty()) {
            return Map.of();
        }
        String ids = igdbIds.stream().map(String::valueOf).collect(Collectors.joining(","));
        String body = "fields cover.image_id;\nwhere id = (" + ids + ");\nlimit 500;\n";
        Map<Long, String> covers = new HashMap<>();
        for (IgdbHit hit : games(body)) {
            if (hit.imageId() != null) {
                covers.put(hit.id(), hit.imageId());
            }
        }
        return covers;
    }

    /** IGDB serves images from its CDN; t_cover_big is 264×374. */
    public static String coverUrl(String imageId) {
        return imageId == null ? null : "https://images.igdb.com/igdb/image/upload/t_cover_big/" + imageId + ".jpg";
    }

    private List<IgdbHit> games(String body) {
        List<IgdbHit> hits = http.post()
            .uri("https://api.igdb.com/v4/games")
            .header("Client-ID", clientId)
            .header("Authorization", "Bearer " + token())
            .contentType(MediaType.TEXT_PLAIN)
            .body(body)
            .retrieve()
            .body(new ParameterizedTypeReference<List<IgdbHit>>() {});
        return hits == null ? List.of() : hits;
    }

    /** Without these a stalled IGDB connection holds a request thread forever. */
    private static JdkClientHttpRequestFactory timeouts() {
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(client);
        factory.setReadTimeout(Duration.ofSeconds(10));
        return factory;
    }

    private static Integer year(Long firstReleaseDate) {
        if (firstReleaseDate == null) {
            return null;
        }
        return Instant.ofEpochSecond(firstReleaseDate).atZone(ZoneOffset.UTC).getYear();
    }

    private record IgdbHit(
        long id,
        String name,
        @JsonProperty("first_release_date") Long firstReleaseDate,
        Cover cover
    ) {
        String imageId() {
            return cover == null ? null : cover.imageId();
        }
    }

    private record Cover(@JsonProperty("image_id") String imageId) {}

    private record TokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("expires_in") long expiresIn
    ) {}
}
