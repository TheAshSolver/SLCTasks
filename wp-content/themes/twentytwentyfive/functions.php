<?php
/**
 * Twenty Twenty-Five functions and definitions.
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package WordPress
 * @subpackage Twenty_Twenty_Five
 * @since Twenty Twenty-Five 1.0
 */

// Adds theme support for post formats.
if ( ! function_exists( 'twentytwentyfive_post_format_setup' ) ) :
	/**
	 * Adds theme support for post formats.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_post_format_setup() {
		add_theme_support( 'post-formats', array( 'aside', 'audio', 'chat', 'gallery', 'image', 'link', 'quote', 'status', 'video' ) );
	}
endif;
add_action( 'after_setup_theme', 'twentytwentyfive_post_format_setup' );

// Enqueues editor-style.css in the editors.
if ( ! function_exists( 'twentytwentyfive_editor_style' ) ) :
	/**
	 * Enqueues editor-style.css in the editors.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_editor_style() {
		add_editor_style( 'assets/css/editor-style.css' );
	}
endif;
add_action( 'after_setup_theme', 'twentytwentyfive_editor_style' );

// Enqueues the theme stylesheet on the front.
if ( ! function_exists( 'twentytwentyfive_enqueue_styles' ) ) :
	/**
	 * Enqueues the theme stylesheet on the front.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_enqueue_styles() {
		$suffix = SCRIPT_DEBUG ? '' : '.min';
		$src    = 'style' . $suffix . '.css';

		wp_enqueue_style(
			'twentytwentyfive-style',
			get_parent_theme_file_uri( $src ),
			array(),
			wp_get_theme()->get( 'Version' )
		);
		wp_style_add_data(
			'twentytwentyfive-style',
			'path',
			get_parent_theme_file_path( $src )
		);
	}
endif;
add_action( 'wp_enqueue_scripts', 'twentytwentyfive_enqueue_styles' );

// Registers custom block styles.
if ( ! function_exists( 'twentytwentyfive_block_styles' ) ) :
	/**
	 * Registers custom block styles.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_block_styles() {
		register_block_style(
			'core/list',
			array(
				'name'         => 'checkmark-list',
				'label'        => __( 'Checkmark', 'twentytwentyfive' ),
				'inline_style' => '
				ul.is-style-checkmark-list {
					list-style-type: "\2713";
				}

				ul.is-style-checkmark-list li {
					padding-inline-start: 1ch;
				}',
			)
		);
	}
endif;
add_action( 'init', 'twentytwentyfive_block_styles' );

// Registers pattern categories.
if ( ! function_exists( 'twentytwentyfive_pattern_categories' ) ) :
	/**
	 * Registers pattern categories.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_pattern_categories() {

		register_block_pattern_category(
			'twentytwentyfive_page',
			array(
				'label'       => __( 'Pages', 'twentytwentyfive' ),
				'description' => __( 'A collection of full page layouts.', 'twentytwentyfive' ),
			)
		);

		register_block_pattern_category(
			'twentytwentyfive_post-format',
			array(
				'label'       => __( 'Post formats', 'twentytwentyfive' ),
				'description' => __( 'A collection of post format patterns.', 'twentytwentyfive' ),
			)
		);
	}
endif;
add_action( 'init', 'twentytwentyfive_pattern_categories' );

// Registers block binding sources.
if ( ! function_exists( 'twentytwentyfive_register_block_bindings' ) ) :
	/**
	 * Registers the post format block binding source.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_register_block_bindings() {
		register_block_bindings_source(
			'twentytwentyfive/format',
			array(
				'label'              => _x( 'Post format name', 'Label for the block binding placeholder in the editor', 'twentytwentyfive' ),
				'get_value_callback' => 'twentytwentyfive_format_binding',
			)
		);
	}
endif;
add_action( 'init', 'twentytwentyfive_register_block_bindings' );

// Registers block binding callback function for the post format name.
if ( ! function_exists( 'twentytwentyfive_format_binding' ) ) :
	/**
	 * Callback function for the post format name block binding source.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return string|void Post format name, or nothing if the format is 'standard'.
	 */
	function twentytwentyfive_format_binding() {
		$post_format_slug = get_post_format();

		if ( $post_format_slug && 'standard' !== $post_format_slug ) {
			return get_post_format_string( $post_format_slug );
		}
	}


endif;

add_shortcode('graphql_clubs', function() {
    $response = wp_remote_post('http://gateway/graphql', [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode(['query' => '{ allClubs(onlyActive: true) { cid name category } }']),
        'timeout' => 15
    ]);

    if (is_wp_error($response)) return "Connection Error";

    $data = json_decode(wp_remote_retrieve_body($response), true);
    $clubs = $data['data']['allClubs'] ?? [];

    if (empty($clubs)) return "No active clubs found.";

    // CSS for the rectangular boxes
    $output = '<style>
        .clubs-grid {
            display: grid;
			grid-template-columns: auto auto auto;
            gap: 20px;		
            margin-top: 20px;
        }
        .club-card {
            flex: 1 1 calc(33.333% - 20px);
            min-width: 250px;
            background: #ffffffff;
            border: 1px solid #252020ff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: transform 0.2s;
        }
        .club-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .club-name {
            font-size: 1.25rem;
            font-weight: bold;
            color: #103016ff;
            margin-bottom: 10px;
            display: block;
        }
        .club-category {
            display: inline-block;
            background: #f0f0f0;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.8rem;
            color: #666;
        }
    </style>';

    $output .= '<div class="clubs-grid">';
    foreach ($clubs as $club) {
        $url = "https://clubs.iiit.ac.in/clubs/" . esc_attr($club['cid']);
        $output .= '<div class="club-card">';
        $output .= '<a href="' . $url . '" class="club-name" target="_blank">' . esc_html($club['name']) . '</a>';
        if (!empty($club['category'])) {
            $output .= '<span class="club-category">' . esc_html($club['category']) . '</span>';
        }
        $output .= '</div>';
    }
    $output .= '</div>';

    return $output;
});

add_shortcode('graphql_events', function() {
   
    $search_term = isset($_POST['event_search']) ? sanitize_text_field($_POST['event_search']) : '';

    
    $clubs_res = wp_remote_post('http://gateway/graphql', [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode(['query' => '{ allClubs { cid name } }']),
    ]);
    $club_map = [];
    if (!is_wp_error($clubs_res)) {
        $c_data = json_decode(wp_remote_retrieve_body($clubs_res), true);
        foreach (($c_data['data']['allClubs'] ?? []) as $c) {
            $club_map[$c['cid']] = $c['name'];
        }
    }

  
    $response = wp_remote_post('http://gateway/graphql', [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode(['query' => '{ events(public: true) { name location clubid } }']),
    ]);
    $data = json_decode(wp_remote_retrieve_body($response), true);
    $events = $data['data']['events'] ?? [];


    $output = '<style>
        .search-area { margin-bottom: 20px; text-align: center; }
        .overall { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .card { border: 1px solid #252020; padding: 20px; border-radius: 8px; background: #fff; }
        .card:hover { background: #d5b7b7; }
    </style>';


   $output .= '<div class="search-area">
    <form method="POST" action="' . esc_url( get_permalink() ) . '">
        <input type="text" name="event_search" placeholder="Search event names..."
               value="' . esc_attr($search_term) . '" style="padding:10px; width:250px;">
        <button type="submit" style="padding:10px; cursor:pointer;">Filter</button>
        ' . ($search_term ? '<a href="' . get_permalink() . '" style="margin-left:10px;background: rgba(8, 41, 76, 0);color: #FFFFFF">Reset</a>' : '') . '
    </form>
</div>';

    // 6. Loop and Filter
    $output .= '<div class="overall">';
    foreach ($events as $event) {
        if ($search_term !== '' && stripos($event['name'], $search_term) === false) {
            continue;
        }

        $c_name = isset($club_map[$event['clubid']]) ? $club_map[$event['clubid']] : $event['clubid'];
        $output .= "<div class='card'>";
        $output .= "<strong>" . esc_html($event['name']) . "</strong><br>";
        $output .= "<small>Organized by: " . esc_html($c_name) . "</small>";
        $output .= "</div>";
    }
    $output .= '</div>';

    return $output;
});