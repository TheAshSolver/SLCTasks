<?php
/* Template Name: GraphQL Clubs */
get_header();
?>

<div style="padding: 40px; max-width: 800px; margin: auto;">
    <h1>Clubs List</h1>
    <?php
    // We use the service name 'gateway' because of Docker networking
    $response = wp_remote_post('http://gateway/graphql', [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode([
            'query' => '{ activeClubs { cid name } }'
        ])
    ]);

    if (is_wp_error($response)) {
        echo "Error fetching data.";
    } else {
        $data = json_decode(wp_remote_retrieve_body($response), true);
        $clubs = $data['data']['activeClubs'] ?? [];

        foreach ($clubs as $club) {
            $site_url = "https://clubs.iiit.ac.in/clubs/" . $club['cid'];
            echo "<div style='border: 1px solid #ddd; padding: 10px; margin-bottom: 10px;'>";
            echo "<h3><a href='$site_url' target='_blank'>" . esc_html($club['name']) . "</a></h3>";
            echo "</div>";
        }
    }
    ?>
</div>

<?php get_footer(); ?>